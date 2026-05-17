# 秒杀全流程详解

> 一次秒杀请求的完整链路，涵盖 12 个核心技术点

## 1. 阶段一：网关层过滤

### 技术点 1：链路追踪 ID 生成

```java
// TraceIdGlobalFilter.java
String traceId = UUID.randomUUID().toString().replace("-", "");
ServerHttpRequest request = exchange.getRequest().mutate()
        .header("X-Trace-Id", traceId)
        .build();
return chain.filter(exchange.mutate().request(request).build());
```

SkyWalking 自动采集 TraceId，全链路日志关联，方便问题排查。

### 技术点 2：JWT 认证

```java
// AuthGlobalFilter.java - 网关统一认证
String token = getToken(request);
if (!jwtUtil.validateToken(token)) {
    return unauthorized(exchange, "认证信息无效");
}
Long userId = jwtUtil.getUserIdFromToken(token);
// 放入请求头传递给下游
```

白名单路径放行，无效请求拦截，用户信息透传至下游服务。

### 技术点 3：网关限流 (Sentinel)

```yaml
spring.cloud.sentinel.scg:
  rules:
    - resource: "/api/v1/seckill/**"
      count: 10000      # QPS限制
      grade: 1           # QPS模式
```

入口流量控制，保护后端服务，超限快速失败返回。

## 2. 阶段二：秒杀服务处理

### 技术点 4：服务级限流

```java
@SentinelResource(
    value = "seckill",
    blockHandler = "handleBlock"
)
public Result<SeckillResponse> doSeckill(SeckillRequest request) { }
```

| 维度 | 配置 | 说明 |
|------|------|------|
| 服务级 | 1000 QPS | 单机限流 |
| 热点参数 | 500 QPS | 按 productId 限流 |

### 技术点 5：校验链（责任链模式）

```
1. ActivityStatusValidator (优先级 100)
   - 查询活动信息（本地缓存 → Redis → DB）
   - 校验活动状态和时间
2. UserQualificationValidator (优先级 200)
   - Dubbo 调用 UserService 校验用户状态
3. RepeatOrderValidator (优先级 300)
   - Redis SETNX 判断是否已购
4. PurchaseLimitValidator (优先级 400)
   - Redis INCR 计数，校验限购数量
```

优势：可插拔易扩展，顺序执行短路返回，每个校验器职责单一。

### 技术点 6：Redis 预减库存（Lua 脚本）

```lua
-- 原子操作，防止超卖
if redis.call('EXISTS', KEYS[2]) == 1 then return -2 end  -- 已售罄
local stock = tonumber(redis.call('GET', KEYS[1]) or 0)
if stock < tonumber(ARGV[1]) then
    redis.call('SET', KEYS[2], '1', 'EX', 86400)
    return -1  -- 库存不足
end
redis.call('DECRBY', KEYS[1], ARGV[1])
return 1  -- 成功
```

原子性保证，减少网络往返，避免竞态条件。

### 技术点 7：分布式锁

```java
@DistributedLock(
    key = "'seckill:' + #context.userId + ':' + #context.productId",
    waitTime = 0,     // 不等待
    leaseTime = 10    // 10秒自动释放
)
```

防止同一用户并发请求，获取失败直接返回。

### 技术点 8：异步削峰（RocketMQ）

```java
SeckillOrderMessage message = SeckillOrderMessage.builder()
        .messageId(generateMessageId())
        .orderId(orderId)
        .userId(userId)
        .productId(productId)
        .traceId(traceId)
        .build();
rocketMQTemplate.syncSend("seckill-topic", message);
return Result.success(SeckillResponse.queuing(orderId));
```

```
请求峰值            MQ缓冲              平稳消费
█████████         ═══════════         ────────
█████████    →    ═══════════    →    ────────
10000 QPS         队列堆积            500 QPS
```

## 3. 阶段三：订单服务消费

### 技术点 9：消费幂等

```java
String consumedKey = "order:mq:consumed:" + message.getMessageId();
Boolean success = redisTemplate.opsForValue()
        .setIfAbsent(consumedKey, "1", 24, TimeUnit.HOURS);
if (Boolean.FALSE.equals(success)) {
    return;  // 已消费过，跳过
}
```

消息 ID 全局唯一，Redis SETNX 原子判断，24 小时过期防止内存膨胀。

### 技术点 10：分布式事务（Seata AT 模式）

```java
@GlobalTransactional(name = "seckill-create-order", timeoutMills = 30000)
public OrderDTO createSeckillOrder(CreateOrderRequest request) {
    // 分支1：创建订单（本地事务）
    Order order = createOrder(request);
    orderMapper.insert(order);

    // 分支2：扣减库存（Dubbo 远程调用）
    Result<Boolean> result = inventoryService.deductStock(stockRequest);
    if (!result.isSuccess()) {
        throw new BusinessException("库存扣减失败");  // 触发全局回滚
    }
    return orderDTO;
}
```

### 技术点 11：乐观锁扣减库存

```sql
UPDATE t_inventory
SET available_stock = available_stock - #{quantity},
    sold_stock = sold_stock + #{quantity},
    version = version + 1
WHERE product_id = #{productId}
  AND available_stock >= #{quantity}
  AND version = #{version}
```

带重试机制的乐观锁，最多重试 3 次。

### 技术点 12：超时处理

```java
// 发送延迟消息，30分钟后检查超时
rocketMQTemplate.syncSend(
    "order-timeout-topic:timeout",
    MessageBuilder.withPayload(message).build(),
    3000, 16  // 延迟级别16 = 30分钟
);
```

## 4. 性能数据

### 各阶段耗时

| 阶段 | 操作 | 预期耗时 |
|------|------|---------|
| 网关 | 认证+限流 | < 5ms |
| 校验 | 活动校验 | < 10ms |
| 库存 | 预减库存 | < 5ms |
| 锁 | 获取锁 | < 10ms |
| MQ | 发送消息 | < 10ms |
| **总计** | **同步响应** | **< 50ms** |

### 吞吐量预期

| 场景 | QPS | 说明 |
|------|-----|------|
| 网关层 | 10000+ | Sentinel 限流上限 |
| 秒杀服务 | 3000+ | 3 个实例 |
| 订单消费 | 500+ | MQ 平滑消费 |

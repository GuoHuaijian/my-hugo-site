---
title: "秒杀全流程详解"
description: "智慧书店项目技术文档 - 秒杀全流程详解"
date: 2024-01-01
weight: 4
difficulty: 2
readTime: 30
keywords: ['秒杀', '业务流程', '高并发', '订单']
---

# 秒杀全流程详解

> 本文详细拆解一次秒杀请求的完整链路，涵盖12个核心技术点

## 1. 流程全景图
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 秒杀请求完整链路                                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│ │
│ [用户点击抢购]                                                                   │
│ │ │
│ ▼                                                                               │
│ ┌─────────────────────────────────────────────────────────────────────────┐     │
│ │ 阶段1: 网关层过滤                                                            │     │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                       │     │
│ │ │生成TraceId│→│黑名单检查│→│JWT认证  │→│网关限流 │                       │     │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘                       │     │
│ └─────────────────────────────────────────────────────────────────────────┘     │
│ │ │
│ ▼                                                                               │
│ ┌─────────────────────────────────────────────────────────────────────────┐     │
│ │ 阶段2: 秒杀服务处理                                                          │     │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │     │
│ │ │服务限流 │→│校验链   │→│Redis预减│→│分布式锁 │→│发送MQ  │               │     │
│ │ │Sentinel ││责任链   ││Lua脚本 ││Redisson ││RocketMQ│               │     │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘               │     │
│ │ │           │           │           │           │                         │     │
│ │ 返回"排队中" ◄──────────┘           │           │                         │     │
│ └─────────────────────────────────────────────────────────────────────────┘     │
│ │ │
│ │ [异步]                                                                        │
│ ▼                                                                               │
│ ┌─────────────────────────────────────────────────────────────────────────┐     │
│ │ 阶段3: 订单服务消费                                                          │     │
│ │ ┌─────────┐ ┌─────────────────────────────────────────────────┐           │     │
│ │ │MQ消费   │→│ @GlobalTransactional                           │           │     │
│ │ │幂等校验 ││ ┌──────────┐ ┌──────────┐                       │           │     │
│ │ └─────────┘ │ │创建订单 │ ──Dubbo调用──► │扣减库存 │           │     │     │
│ │             │ │分库分表写入│ │乐观锁更新│           │     │     │
│ │             │ └──────────┘ └──────────┘                       │           │     │
│ │ └─────────────────────────────────────────────────┘           │     │
│ └─────────────────────────────────────────────────────────────────────────┘     │
│ │ │
│ ▼                                                                               │
│ ┌─────────────────────────────────────────────────────────────────────────┐     │
│ │ 阶段4: 结果处理                                                              │     │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐                                   │     │
│ │ │保存结果 │→│发送延迟 │→│前端轮询 │                                   │     │
│ │ │到Redis ││取消消息 ││获取结果 │                                   │     │
│ │ └─────────┘ └─────────┘ └─────────┘                                   │     │
│ └─────────────────────────────────────────────────────────────────────────┘     │
│ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 2. 阶段详解

### 2.1 阶段一：网关层过滤

#### 技术点1：链路追踪ID生成
```java
// TraceIdGlobalFilter.java
@Override
public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    // 生成全局唯一TraceId
    String traceId = UUID.randomUUID().toString().replace("-", "");

    // 放入请求头，传递给下游服务
    ServerHttpRequest request = exchange.getRequest().mutate()
            .header("X-Trace-Id", traceId)
            .build();

    return chain.filter(exchange.mutate().request(request).build());
}
```
作用：
- 全链路追踪的起点
- 日志关联，方便问题排查
- SkyWalking自动采集

#### 技术点2：JWT认证
```java
// AuthGlobalFilter.java
@Override
public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    // 白名单放行
    if (isWhitelist(path)) {
        return chain.filter(exchange);
    }

    // 获取并验证Token
    String token = getToken(request);
    if (!jwtUtil.validateToken(token)) {
        return unauthorized(exchange, "认证信息无效");
    }

    // 解析用户信息，传递给下游
    Long userId = jwtUtil.getUserIdFromToken(token);
    request = request.mutate()
            .header("X-User-Id", String.valueOf(userId))
            .build();

    return chain.filter(exchange.mutate().request(request).build());
}
```
作用：
- 统一认证入口
- 用户信息透传
- 无效请求拦截

#### 技术点3：网关限流
```yaml
# Sentinel网关限流规则
spring.cloud.sentinel.scg:
  rules:
    - resource: "/api/v1/seckill/**"
      count: 10000      # QPS限制
      grade: 1          # QPS模式
```
作用：
- 入口流量控制
- 保护后端服务
- 快速失败返回

### 2.2 阶段二：秒杀服务处理

#### 技术点4：服务级限流
```java
@SentinelResource(
    value = "seckill",
    blockHandlerClass = SeckillBlockHandler.class,
    blockHandler = "handleBlock"
)
public Result<SeckillResponse> doSeckill(SeckillRequest request) {
    // 业务逻辑
}
```

| 维度 | 配置 | 说明 |
|------|------|------|
| 服务级 | 1000 QPS | 单机限流 |
| 热点参数 | 500 QPS | 按productId限流 |

#### 技术点5：校验链（责任链模式）
```java
// 校验链执行顺序
┌─────────────────────────────────────────────────────┐
│ 1. ActivityStatusValidator (100)                   │
│    - 查询活动信息（本地缓存 → Redis → DB）           │
│    - 校验活动状态、时间                              │
├─────────────────────────────────────────────────────┤
│ 2. UserQualificationValidator (200)                │
│    - Dubbo调用UserService                           │
│    - 校验用户状态                                    │
├─────────────────────────────────────────────────────┤
│ 3. RepeatOrderValidator (300)                       │
│    - Redis SETNX判断是否已购                         │
│    - Key: seckill:bought:{activityId}:{userId}      │
├─────────────────────────────────────────────────────┤
│ 4. PurchaseLimitValidator (400)                     │
│    - Redis INCR计数                                 │
│    - 校验是否超过限购数量                            │
└─────────────────────────────────────────────────────┘
```

设计优势：
- 可插拔，易扩展
- 按顺序执行，短路返回
- 每个校验器职责单一

#### 技术点6：Redis预减库存（Lua脚本）
```lua
-- seckill_stock.lua
-- 原子操作，防止超卖

-- 1. 检查售罄标记
if redis.call('EXISTS', KEYS[2]) == 1 then
    return -2  -- 已售罄
end

-- 2. 获取当前库存
local stock = tonumber(redis.call('GET', KEYS[1]) or 0)

-- 3. 判断库存是否充足
if stock < tonumber(ARGV[1]) then
    redis.call('SET', KEYS[2], '1', 'EX', 86400)  -- 设置售罄标记
    return -1  -- 库存不足
end

-- 4. 扣减库存
redis.call('DECRBY', KEYS[1], ARGV[1])
return 1  -- 成功
```

为什么用Lua：
- 原子性：多条命令一次执行
- 减少网络往返
- 避免竞态条件

#### 技术点7：分布式锁
```java
@DistributedLock(
    key = "'seckill:' + #context.userId + ':' + #context.productId",
    waitTime = 0,        // 不等待
    leaseTime = 10       // 10秒自动释放
)
private Result<SeckillResponse> doSeckillWithLock(SeckillContext context) {
    // 发送MQ消息
}
```
作用：
- 防止同一用户并发请求
- 配合前端防抖使用
- 获取失败直接返回

#### 技术点8：异步削峰
```java
// 发送MQ消息
SeckillOrderMessage message = SeckillOrderMessage.builder()
        .messageId(generateMessageId())
        .orderId(orderId)
        .userId(userId)
        .productId(productId)
        .traceId(traceId)  // TraceId透传
        .build();

rocketMQTemplate.syncSend(destination, message);

// 立即返回排队状态
return Result.success(SeckillResponse.queuing(orderId));
```

削峰效果：
```
请求峰值            MQ缓冲              平稳消费
   │                  │                   │
   ▼                  ▼                   │
█████████         ═══════════         ────────
█████████    →    ═══════════    →    ────────
█████████         ═══════════         ────────
10000 QPS         队列堆积            500 QPS
```

### 2.3 阶段三：订单服务消费

#### 技术点9：消费幂等
```java
// 幂等校验
String consumedKey = "order:mq:consumed:" + message.getMessageId();
Boolean success = redisTemplate.opsForValue()
        .setIfAbsent(consumedKey, "1", 24, TimeUnit.HOURS);

if (Boolean.FALSE.equals(success)) {
    log.warn("消息已消费过: {}", message.getMessageId());
    return;  // 直接返回成功
}
```

幂等设计：
- 消息ID全局唯一
- Redis SETNX原子判断
- 24小时过期防止内存膨胀

#### 技术点10：分布式事务
```java
@GlobalTransactional(
    name = "seckill-create-order",
    rollbackFor = Exception.class,
    timeoutMills = 30000
)
public OrderDTO createSeckillOrder(CreateOrderRequest request) {
    // 分支1：创建订单（本地事务）
    Order order = createOrder(request);
    orderMapper.insert(order);

    // 分支2：扣减库存（Dubbo远程调用）
    Result<Boolean> result = inventoryService.deductStock(stockRequest);
    if (!result.isSuccess()) {
        throw new BusinessException("库存扣减失败");  // 触发全局回滚
    }

    return orderDTO;
}
```

Seata AT模式流程：
```
┌─────────────────────────────────────────────────────────────────┐
│                        TM (事务管理器)                           │
│                     OrderServiceImpl                            │
└─────────────────────────────────────────────────────────────────┘
         │                                    │
         │ 1.开启全局事务                       │
         ▼                                    ▼
┌─────────────────────┐            ┌─────────────────────┐
│   RM (资源管理器)    │            │   RM (资源管理器)    │
│   订单服务分支       │            │   库存服务分支       │
│                     │            │                     │
│ 1.执行本地事务       │            │ 1.执行本地事务       │
│ 2.记录undo_log     │            │ 2.记录undo_log     │
│ 3.上报分支状态       │            │ 3.上报分支状态       │
└─────────────────────┘            └─────────────────────┘
         │                                    │
         └─────────────────┬──────────────────┘
                           ▼
                    ┌─────────────┐
                    │ TC (事务协调) │
                    │   Seata     │
                    │             │
                    │ 全局提交/回滚 │
                    └─────────────┘
```

#### 技术点11：分库分表
```yaml
# ShardingSphere配置
rules:
  sharding:
    tables:
      t_order:
        actual-data-nodes: ds$->{0..1}.t_order_$->{0..3}
        # 分库：user_id % 2
        database-strategy:
          standard:
            sharding-column: user_id
            sharding-algorithm-name: database-inline
        # 分表：user_id % 4
        table-strategy:
          standard:
            sharding-column: user_id
            sharding-algorithm-name: table-inline
```

分片效果：
```
用户请求               分片路由                     物理存储
─────────────────────────────────────────────────────────────
user_id=1  ──►  1%2=1, 1%4=1  ──►  ds1.t_order_1
user_id=2  ──►  2%2=0, 2%4=2  ──►  ds0.t_order_2
user_id=3  ──►  3%2=1, 3%4=3  ──►  ds1.t_order_3
user_id=4  ──►  4%2=0, 4%4=0  ──►  ds0.t_order_0
```

#### 技术点12：乐观锁扣减
```java
// 乐观锁更新，带重试
int retryCount = 0;
while (retryCount < 3) {
    Inventory inventory = inventoryMapper.selectByProductId(productId);

    // 检查库存
    if (inventory.getAvailableStock() < quantity) {
        throw new BusinessException("库存不足");
    }

    // 乐观锁更新
    int rows = inventoryMapper.deductStock(
            productId,
            quantity,
            inventory.getVersion()  // 版本号
    );

    if (rows > 0) {
        // 记录流水
        recordStockWater(productId, quantity, orderNo);
        return true;
    }

    retryCount++;
    log.warn("库存扣减冲突，重试: {}", retryCount);
}

throw new BusinessException("库存扣减失败");
```

乐观锁SQL：
```sql
UPDATE t_inventory
SET available_stock = available_stock - #{quantity},
    sold_stock = sold_stock + #{quantity},
    version = version + 1
WHERE product_id = #{productId}
  AND available_stock >= #{quantity}
  AND version = #{version}
```

### 2.4 阶段四：结果处理
```java
// 保存结果到Redis（供前端轮询）
String resultKey = "seckill:result:" + orderId;
String result = JSON.toJSONString(new OrderResult(true, orderNo, null));
redisTemplate.opsForValue().set(resultKey, result, 10, TimeUnit.MINUTES);

// 发送延迟消息（30分钟后检查超时）
rocketMQTemplate.syncSend(
    "order-timeout-topic:timeout",
    MessageBuilder.withPayload(message).build(),
    3000,
    16  // 延迟级别16 = 30分钟
);
```

前端轮询逻辑：
```javascript
const pollResult = async (orderId) => {
    let count = 0;
    const maxCount = 30;

    const timer = setInterval(async () => {
        count++;
        if (count > maxCount) {
            clearInterval(timer);
            showTimeout();
            return;
        }

        const res = await getSeckillResult(orderId);
        if (res.data.status === 'SUCCESS') {
            clearInterval(timer);
            showSuccess(res.data.orderNo);
        } else if (res.data.status === 'FAIL') {
            clearInterval(timer);
            showFail(res.data.message);
        }
        // QUEUING状态继续轮询
    }, 1000);
}
```

## 3. 异常处理流程

### 3.1 回滚场景
```
┌─────────────────────────────────────────────────────────────────┐
│                        异常回滚流程                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  场景1: 库存扣减失败                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                    │
│  │订单已创建│ ── │库存失败 │ ── │全局回滚 │                    │
│  │(分支1)  │    │(分支2)  │    │         │                    │
│  └─────────┘    └─────────┘    └─────────┘                    │
│       │                              │                         │
│       │      Seata自动补偿           │                         │
│       ▼                              ▼                         │
│  ┌─────────┐                   ┌─────────┐                    │
│  │undo_log│ ────────────────► │订单删除 │                    │
│  │ 回放    │                   │         │                    │
│  └─────────┘                   └─────────┘                    │
│                                                                 │
│  场景2: MQ消费失败                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    │
│  │消费异常 │ ── │回滚Redis│ ── │清除标记 │ ── │保存失败 │    │
│  │         │    │库存    │    │已购标记 │    │结果    │    │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 补偿代码
```java
private void handleFailure(SeckillOrderMessage message, String errorMsg) {
    // 1. 回滚Redis库存
    String stockKey = "seckill:stock:" + message.getProductId();
    redisTemplate.opsForValue().increment(stockKey);

    // 2. 删除售罄标记
    String soldOutKey = "seckill:soldout:" + message.getProductId();
    redisTemplate.delete(soldOutKey);

    // 3. 清除用户已购标记
    String boughtKey = String.format("seckill:bought:%d:%d",
            message.getActivityId(), message.getUserId());
    redisTemplate.delete(boughtKey);

    // 4. 保存失败结果
    saveResult(message.getOrderId(), false, null, errorMsg);
}
```

## 4. 性能数据

### 4.1 各阶段耗时

| 阶段 | 操作 | 预期耗时 | 说明 |
|------|------|---------|------|
| 网关 | 认证+限流 | <5ms | 本地操作 |
| 校验 | 活动校验 | <10ms | 本地缓存命中 |
| 校验 | 用户校验 | <20ms | Dubbo调用 |
| 校验 | 重复检查 | <5ms | Redis操作 |
| 库存 | 预减库存 | <5ms | Lua脚本 |
| 锁 | 获取锁 | <10ms | Redisson |
| MQ | 发送消息 | <10ms | 同步发送 |
| 总计 | 同步响应 | <50ms | 返回排队状态 |

### 4.2 吞吐量预期

| 场景 | QPS | 说明 |
|------|-----|------|
| 网关层 | 10000+ | Sentinel限流上限 |
| 秒杀服务 | 3000+ | 3个实例 |
| 订单消费 | 500+ | MQ平滑消费 |

## 5. 面试要点

### 5.1 必问问题
**如何防止超卖？**

- Redis预减库存（Lua原子操作）
- 数据库乐观锁兜底

**如何保证一致性？**

- Seata AT模式分布式事务
- 失败自动回滚+补偿

**如何应对高并发？**

- 多级限流
- MQ异步削峰
- 快速失败

### 5.2 亮点表达
- "使用责任链模式实现校验链，易于扩展"
- "Lua脚本保证库存操作的原子性"
- "分布式事务采用Seata AT模式，对业务代码侵入小"

---

[返回文档首页](../README.md) | [下一篇：订单流程详解](./order-flow.md)

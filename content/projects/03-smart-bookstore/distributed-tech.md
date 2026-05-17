# 分布式技术专题

## 1. 分布式锁（Redisson）

### 使用方式

```java
// 注解式
@DistributedLock(
    key = "'seckill:' + #userId + ':' + #productId",
    waitTime = 0,
    leaseTime = 10
)
public Result<?> doSeckill(Long userId, Long productId) { }

// 编程式
RLock lock = redissonClient.getLock("seckill:" + userId + ":" + productId);
if (lock.tryLock(0, 10, TimeUnit.SECONDS)) {
    try { /* 业务逻辑 */ } finally { lock.unlock(); }
}
```

### 特性
- **可重入**：同一线程可多次获取同一把锁
- **自动续期**：看门狗机制，业务未完成自动续期
- **读写锁**：`DistributedReadWriteLock` 支持读写分离

### Redisson 配置

```yaml
spring:
  redis:
    host: localhost
    port: 6379
    password:
    timeout: 3000
```

## 2. 分布式事务（Seata AT 模式）

### AT 模式流程

```
TM (事务管理器)                       TC (事务协调器)
     │                                    │
     │ 1. 开启全局事务                     │
     ├─────────────────────────────────────►
     │                                    │
     ▼                                    │
┌─────────────┐                          │
│ RM 订单服务  │                          │
│ 1. 执行SQL  │                          │
│ 2. 记录undo_log │                      │
│ 3. 上报分支  │                          │
└─────────────┘                          │
     │                                    │
┌─────────────┐                          │
│ RM 库存服务  │                          │
│ 1. 执行SQL  │                          │
│ 2. 记录undo_log │                      │
│ 3. 上报分支  │                          │
└─────────────┘                          │
     │                                    │
     ├── 全部成功 ────────────────────────► 全局提交
     └── 任一失败 ────────────────────────► 全局回滚（根据 undo_log 自动补偿）
```

### 核心代码

```java
@GlobalTransactional(name = "create-order", timeoutMills = 30000)
public void createOrder(OrderDTO order) {
    orderMapper.insert(order);           // 本地事务
    inventoryService.deduct(order);       // Dubbo 远程调用
    // 任一失败自动全局回滚
}
```

### Seata 配置

```yaml
seata:
  enabled: true
  application-id: ${spring.application.name}
  tx-service-group: bookstore-tx-group
  service:
    vgroup-mapping:
      bookstore-tx-group: default
  config:
    type: nacos
    nacos:
      server-addr: localhost:8848
```

## 3. 分库分表（ShardingSphere-JDBC）

### 分片配置

```yaml
rules:
  sharding:
    tables:
      t_order:
        actual-data-nodes: ds$->{0..1}.t_order_$->{0..3}
        database-strategy:
          standard:
            sharding-column: user_id
            sharding-algorithm-name: database-inline
        table-strategy:
          standard:
            sharding-column: user_id
            sharding-algorithm-name: table-inline
      t_inventory:
        actual-data-nodes: ds$->{0..1}.t_inventory
        database-strategy:
          standard:
            sharding-column: product_id
            sharding-algorithm-name: database-inline
```

### 分片算法

```java
public class DatabaseShardingAlgorithm implements StandardShardingAlgorithm<Long> {
    @Override
    public String doSharding(Collection<String> availableTargetNames,
                             PreciseShardingValue<Long> shardingValue) {
        long index = shardingValue.getValue() % 2;
        return "ds" + index;
    }
}
```

### 绑定表优化

```yaml
rules:
  sharding:
    binding-tables:
      - t_order, t_order_item
```

绑定表避免跨库 JOIN 的笛卡尔积查询。

## 4. 消息队列（RocketMQ）

### 消息类型

```java
// 普通消息 - 秒杀异步削峰
rocketMQTemplate.syncSend("seckill-topic", message);

// 延迟消息 - 订单超时检查（延迟级别16 = 30分钟）
rocketMQTemplate.syncSend("order-timeout", message, 3000, 16);

// 事务消息 - 分布式事务最终一致性
TransactionSendResult result = rocketMQTemplate.sendMessageInTransaction(
    "tx-group", "order-topic", message, orderDTO);
```

### 幂等消费

```java
@RocketMQMessageListener(topic = "seckill-topic", consumerGroup = "seckill-consumer")
public class SeckillConsumer implements RocketMQListener<SeckillOrderMessage> {

    @Override
    public void onMessage(SeckillOrderMessage message) {
        // Redis SETNX 幂等校验
        String key = "consumed:" + message.getMessageId();
        Boolean success = redisTemplate.opsForValue()
                .setIfAbsent(key, "1", 24, TimeUnit.HOURS);
        if (Boolean.FALSE.equals(success)) return; // 已消费

        // 业务处理...
    }
}
```

## 5. 限流降级（Sentinel）

### 规则配置

```yaml
# 网关流控
spring.cloud.sentinel.scg:
  rules:
    - resource: "/api/v1/seckill/**"
      count: 10000
      grade: 1

# 服务流控（Nacos动态配置）
[
    {
        "resource": "seckill",
        "limitApp": "default",
        "grade": 1,
        "count": 1000,
        "strategy": 0,
        "controlBehavior": 0
    }
]
```

### 代码埋点

```java
@SentinelResource(
    value = "seckill",
    blockHandler = "handleBlock",
    fallback = "handleFallback"
)
public Result<SeckillResponse> doSeckill(SeckillRequest request) { }

public Result<SeckillResponse> handleBlock(SeckillRequest request, BlockException e) {
    return Result.error("系统繁忙，请稍后再试");
}
```

### 熔断降级策略

- **慢调用比例**：响应时间 > 500ms 的比例超过阈值则熔断
- **异常比例**：异常数占比超过阈值则熔断
- **异常数**：一分钟内异常数超过阈值则熔断

## 6. 可观测性

### 链路追踪（SkyWalking）

通过 SkyWalking Java Agent 无侵入接入，自动采集：
- 分布式调用链路
- 服务间依赖关系
- 各节点耗时
- 异常堆栈

### 日志规范

```xml
<!-- logback-spring.xml -->
<pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] [%X{traceId}] %-5level %logger{36} - %msg%n</pattern>
```

### 关键指标
| 指标 | 采集方式 | 说明 |
|------|---------|------|
| QPS | Sentinel | 实时流量统计 |
| 响应时间 | SkyWalking | 各服务调用耗时 |
| JVM 指标 | Micrometer | 内存、GC、线程 |
| 业务指标 | 自定义 | 订单量、支付成功率 |

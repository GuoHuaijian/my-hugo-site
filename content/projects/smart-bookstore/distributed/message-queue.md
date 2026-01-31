---
title: "消息队列详解"
description: "智慧书店项目技术文档 - 消息队列详解"
date: 2024-01-01
weight: 10
difficulty: 3
readTime: 30
keywords: ['消息队列', 'RocketMQ', '异步', '削峰填谷']
---

# 消息队列详解

> RocketMQ异步削峰、可靠投递、幂等消费

## 1. 消息队列概述

### 1.1 为什么使用消息队列
在秒杀系统中，消息队列主要用于：
- **削峰填谷**：应对瞬时高并发，保护系统稳定性
- **系统解耦**：服务间异步通信，降低耦合度
- **异步处理**：非核心流程异步化，提升响应速度
- **数据一致性**：通过消息保证最终一致性

### 1.2 消息队列对比

| MQ | 优点 | 缺点 | 适用场景 |
|----|------|------|----------|
| RocketMQ | 高性能、事务消息、延迟消息、分布式 | 学习曲线陡峭 | 电商、金融 |
| Kafka | 高吞吐、持久化、分布式生态 | 实时性一般 | 大数据、日志 |
| RabbitMQ | 功能丰富、易用性好 | 单机性能受限 | 企业应用 |
| Pulsar | 统一架构、多租户 | 新生态，生态不完善 | 新项目 |

**本项目选择RocketMQ**：支持事务消息和延迟消息，适合电商秒杀场景。

## 2. RocketMQ 配置

### 2.1 添加依赖
```xml
<dependency>
    <groupId>org.apache.rocketmq</groupId>
    <artifactId>rocketmq-spring-boot-starter</artifactId>
    <version>2.2.3</version>
</dependency>
```

### 2.2 配置文件
```yaml
# application.yml
rocketmq:
  name-server: localhost:9876
  producer:
    group: seckill-producer-group
    send-message-timeout: 3000
    retry-times-when-send-failed: 2
    compress-message-body-threshold: 4096
    max-message-size: 4194304
  consumer:
    group: seckill-consumer-group
    consume-thread-min: 5
    consume-thread-max: 20
    consume-concurrently-max-span: 2000
    pull-interval: 0
    message-model: CLUSTERING
```

### 2.3 事务消息配置
```java
@Configuration
public class RocketMQConfig {

    @Value("${rocketmq.name-server}")
    private String nameServer;

    @Bean
    public RocketMQTemplate rocketMQTemplate() {
        RocketMQTemplate template = new RocketMQTemplate();
        template.setProducerListener(new MyProducerListener());
        return template;
    }

    @Bean
    public TransactionMQProducer transactionMQProducer() throws MQClientException {
        TransactionMQProducer producer = new TransactionMQProducer("seckill-transaction-producer");
        producer.setNamesrvAddr(nameServer);
        producer.setTransactionListener(new SeckillTransactionListener());
        producer.start();
        return producer;
    }
}
```

## 3. 消息发送实现

### 3.1 同步发送
```java
@Service
public class OrderProducer {

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    /**
     * 同步发送创建订单消息
     */
    public void sendCreateOrderMessage(SeckillOrderMessage message) {
        Message<?> msg = MessageBuilder.withPayload(message)
                .setHeader(MessageConst.PROPERTY_TAGS, "seckill-order")
                .build();

        SendResult result = rocketMQTemplate.syncSend("seckill-topic:order", message, 3000);

        if (result.getSendStatus() != SendStatus.SEND_OK) {
            throw new BusinessException("消息发送失败");
        }
    }

    /**
     * 发送延迟消息
     */
    public void sendDelayMessage(SeckillOrderMessage message, long delayTime) {
        message.setDelayTime(delayTime);

        Message<?> msg = MessageBuilder.withPayload(message)
                .setDelayLevel(3) // 延迟级别3 = 10秒
                .build();

        rocketMQTemplate.syncSend("seckill-topic:delay", msg);
    }
}
```

### 3.2 事务消息
```java
/**
 * 秒杀订单消息
 */
@Data
public class SeckillOrderMessage implements Serializable {
    private static final long serialVersionUID = 1L;

    private String messageId;
    private String orderId;
    private Long userId;
    private Long productId;
    private Long activityId;
    private Integer quantity;
    private String traceId;
    private long createTime;
    private Long delayTime;
}

/**
 * 事务消息监听器
 */
@Component
public class SeckillTransactionListener implements TransactionListener {

    @Autowired
    private LocalTransactionExecutor transactionExecutor;

    @Override
    public LocalTransactionState executeLocalTransaction(Message msg, Object arg) {
        SeckillOrderMessage message = (SeckillOrderMessage) msg.getBody();

        try {
            // 执行本地事务
            transactionExecutor.execute(message);
            return LocalTransactionState.COMMIT_MESSAGE;
        } catch (Exception e) {
            log.error("执行本地事务失败", e);
            return LocalTransactionState.ROLLBACK_MESSAGE;
        }
    }

    @Override
    public LocalTransactionState checkLocalTransaction(MessageExt msg) {
        String messageId = msg.getMsgId();
        SeckillOrderMessage message = (SeckillOrderMessage) JSONObject.parseObject(msg.getBody(), SeckillOrderMessage.class);

        // 检查事务状态
        TransactionStatus status = transactionExecutor.checkStatus(messageId);

        if (status == TransactionStatus.COMMITTED) {
            return LocalTransactionState.COMMIT_MESSAGE;
        } else if (status == TransactionStatus.ROLLBACKED) {
            return LocalTransactionState.ROLLBACK_MESSAGE;
        } else {
            return LocalTransactionState.UNKNOW;
        }
    }
}
```

## 4. 消息消费实现

### 4.1 消息监听器
```java
@Component
@RocketMQMessageListener(
    topic = "seckill-topic",
    consumerGroup = "seckill-consumer-group",
    consumeMode = ConsumeMode.CONCURRENTLY,
    consumeThreadNum = 10
)
public class OrderConsumer implements RocketMQListener<SeckillOrderMessage> {

    @Autowired
    private OrderService orderService;

    @Autowired
    private RedisTemplate redisTemplate;

    @Override
    public void onMessage(SeckillOrderMessage message) {
        try {
            // 幂等校验
            if (checkDuplicate(message)) {
                log.warn("消息已消费: {}", message.getMessageId());
                return;
            }

            // 处理订单
            orderService.processOrder(message);

        } catch (Exception e) {
            log.error("处理消息失败: {}", message.getMessageId(), e);
            // 重新入队
            throw new RocketMQListenerExecutionException(e.getMessage(), e);
        }
    }

    /**
     * 幂等校验
     */
    private boolean checkDuplicate(SeckillOrderMessage message) {
        String key = "mq:consumed:" + message.getMessageId();
        Boolean success = redisTemplate.opsForValue()
                .setIfAbsent(key, "1", 24, TimeUnit.HOURS);

        return Boolean.FALSE.equals(success);
    }
}
```

### 4.2 消息重试
```java
@Component
@RocketMQMessageListener(
    topic = "seckill-topic",
    consumerGroup = "seckill-retry-consumer",
    consumeMode = ConsumeMode.CONCURRENTLY,
    maxReconsumeTimes = 3
)
public class RetryConsumer implements RocketMQListener<SeckillOrderMessage> {

    @Override
    public void onMessage(SeckillOrderMessage message) {
        int retryCount = message.getRetryCount();

        if (retryCount >= 3) {
            // 超过重试次数，记录死信队列
            sendToDeadLetterQueue(message);
            return;
        }

        try {
            // 处理消息
            processWithRetry(message);

        } catch (Exception e) {
            // 更新重试次数
            message.setRetryCount(retryCount + 1);
            throw new RocketMQListenerExecutionException("处理失败，准备重试", e);
        }
    }

    private void sendToDeadLetterQueue(SeckillOrderMessage message) {
        rocketMQTemplate.syncSend("seckill-topic:dead-letter", message);
    }
}
```

## 5. 消息可靠性保障

### 5.1 生产端可靠性
```java
@Component
public class ReliableMessageProducer {

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    /**
     * 可靠发送，带重试
     */
    public boolean sendReliably(String topic, Object message) {
        int retryTimes = 3;
        SendResult result;

        for (int i = 0; i < retryTimes; i++) {
            try {
                result = rocketMQTemplate.syncSend(topic, message, 3000);
                if (result.getSendStatus() == SendStatus.SEND_OK) {
                    return true;
                }
            } catch (Exception e) {
                log.error("消息发送失败，第{}次重试", i + 1, e);
                if (i == retryTimes - 1) {
                    // 最后一次重试失败，记录日志
                    log.error("消息最终发送失败: {}", message);
                    return false;
                }
                // 指数退避
                Thread.sleep((long) Math.pow(2, i) * 1000);
            }
        }
        return false;
    }
}
```

### 5.2 消费端可靠性
```java
@Component
public class ReliableMessageConsumer {

    @Autowired
    private OrderService orderService;

    /**
     * 可靠消费，保证至少消费一次
     */
    public void consumeReliably(SeckillOrderMessage message) {
        String messageId = message.getMessageId();

        try {
            // 1. 幂等校验
            if (isConsumed(messageId)) {
                return;
            }

            // 2. 开始事务
            TransactionSynchronizationManager.bindResource("messageId", messageId);

            // 3. 处理消息
            orderService.processOrder(message);

            // 4. 标记已消费
            markAsConsumed(messageId);

        } catch (Exception e) {
            log.error("消费消息失败: {}", messageId, e);
            throw new RuntimeException(e);
        } finally {
            // 5. 清理资源
            TransactionSynchronizationManager.unbindResource("messageId");
        }
    }

    private boolean isConsumed(String messageId) {
        // 实现幂等校验逻辑
        return false;
    }

    private void markAsConsumed(String messageId) {
        // 标记消息已消费
    }
}
```

## 6. 顺序消息

### 6.1 全局顺序消息
```java
/**
 * 全局顺序消息生产者
 */
@Service
public class OrderSequenceProducer {

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    public void sendOrderSequence(Order order) {
        // 使用同一个消息队列保证顺序
        Message message = MessageBuilder.withPayload(order)
                .setHeader(MessageConst.PROPERTY_QUEUE_ID, 0) // 指定队列
                .build();

        rocketMQTemplate.syncSend("order-topic", message);
    }
}
```

### 6.2 局部顺序消息
```java
/**
 * 局部顺序消息消费者
 */
@Component
@RocketMQMessageListener(
    topic = "order-topic",
    consumerGroup = "order-sequence-consumer",
    consumeMode = ConsumeMode.ORDERLY
)
public class OrderSequenceConsumer implements RocketMQListener<Order> {

    @Override
    public void onMessage(Order order) {
        // 同一个订单ID的消息会顺序消费
        processOrder(order);
    }
}
```

## 7. 消息积压处理

### 7.1 消费者扩容
```yaml
# 动态调整消费者数量
rocketmq:
  consumer:
    consume-thread-num: 20  # 增加消费者线程数
    consume-thread-min: 10
    consume-thread-max: 50
```

### 7.2 消费优化
```java
@Component
public class OptimizedConsumer {

    @Autowired
    private OrderService orderService;

    /**
     * 批量消费
     */
    @RocketMQMessageListener(
        topic = "seckill-topic",
        consumerGroup = "batch-consumer",
        consumeMode = ConsumeMode.CONCURRENTLY,
        consumeThreadNum = 20
    )
    public class BatchConsumer implements RocketMQListener<List<SeckillOrderMessage>> {

        @Override
        public void onMessage(List<SeckillOrderMessage> messages) {
            try {
                // 批量处理
                orderService.batchProcessOrders(messages);
            } catch (Exception e) {
                log.error("批量处理消息失败", e);
                throw new RuntimeException(e);
            }
        }
    }
}
```

## 8. 死信队列处理

### 8.1 死信队列配置
```java
/**
 * 死信队列消费者
 */
@Component
@RocketMQMessageListener(
    topic = "seckill-topic:dead-letter",
    consumerGroup = "dead-letter-consumer",
    consumeMode = ConsumeMode.CONCURRENTLY
)
public class DeadLetterConsumer implements RocketMQListener<SeckillOrderMessage> {

    @Autowired
    private DeadLetterService deadLetterService;

    @Override
    public void onMessage(SeckillOrderMessage message) {
        try {
            // 1. 记录死信日志
            deadLetterService.logDeadLetter(message);

            // 2. 人工处理或自动重试
            if (shouldRetry(message)) {
                // 重新发送到原始队列
                rocketMQTemplate.syncSend("seckill-topic", message);
            } else {
                // 标记为人工处理
                deadLetterService.markForManualProcess(message);
            }

        } catch (Exception e) {
            log.error("处理死信消息失败", e);
        }
    }

    private boolean shouldRetry(SeckillOrderMessage message) {
        // 判断是否需要重试
        return true;
    }
}
```

### 8.2 死信监控
```java
@Service
public class DeadLetterMonitor {

    @Scheduled(fixedRate = 60000) // 每分钟检查一次
    public void checkDeadLetters() {
        List<SeckillOrderMessage> deadLetters = deadLetterService.getRecentDeadLetters();

        if (!deadLetters.isEmpty()) {
            // 发送告警
            sendAlert(deadLetters);

            // 自动重试
            retryDeadLetters(deadLetters);
        }
    }

    private void sendAlert(List<SeckillOrderMessage> messages) {
        Alert alert = new Alert();
        alert.setType("MQ_DEAD_LETTER");
        alert.setContent("有" + messages.size() + "条死信消息需要处理");
        alertService.send(alert);
    }
}
```

## 9. 消息追踪

### 9.1 TraceID 传递
```java
/**
 * 消息生产者（带TraceID）
 */
@Service
public class TraceableProducer {

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    public void sendWithTrace(SeckillOrderMessage message) {
        // 获取当前线程的TraceID
        String traceId = TraceContext.getTraceId();
        message.setTraceId(traceId);

        // 发送消息
        Message<?> msg = MessageBuilder.withPayload(message)
                .setHeader("TRACE_ID", traceId)
                .build();

        rocketMQTemplate.syncSend("seckill-topic", msg);
    }
}
```

### 9.2 消息消费追踪
```java
/**
 * 带追踪的消息消费者
 */
@Component
@RocketMQMessageListener(
    topic = "seckill-topic",
    consumerGroup = "trace-consumer"
)
public class TraceableConsumer implements RocketMQListener<SeckillOrderMessage> {

    @Override
    public void onMessage(SeckillOrderMessage message) {
        // 设置TraceID
        TraceContext.setTraceId(message.getTraceId());

        try {
            // 处理消息
            processOrder(message);
        } finally {
            // 清理TraceID
            TraceContext.clear();
        }
    }
}
```

## 10. 性能优化

### 10.1 批量发送
```java
/**
 * 批量消息发送
 */
@Service
public class BatchMessageProducer {

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    public void sendBatch(List<SeckillOrderMessage> messages) {
        // 分批发送
        int batchSize = 100;
        List<List<SeckillOrderMessage>> batches = Lists.partition(messages, batchSize);

        for (List<SeckillOrderMessage> batch : batches) {
            Message<?> msg = MessageBuilder.withPayload(batch)
                    .setHeader("BATCH_COUNT", batch.size())
                    .build();

            rocketMQTemplate.syncSend("seckill-topic", msg, 5000);
        }
    }
}
```

### 10.2 批量消费
```java
/**
 * 批量消息消费者
 */
@Component
@RocketMQMessageListener(
    topic = "seckill-topic",
    consumerGroup = "batch-consumer",
    consumeMode = ConsumeMode.CONCURRENTLY
)
public class BatchMessageConsumer implements RocketMQListener<List<SeckillOrderMessage>> {

    @Autowired
    private OrderService orderService;

    @Override
    public void onMessage(List<SeckillOrderMessage> batchMessages) {
        try {
            // 批量处理
            orderService.batchProcess(batchMessages);
        } catch (Exception e) {
            log.error("批量处理失败", e);
            throw new RuntimeException(e);
        }
    }
}
```

## 11. 监控和运维

### 11.1 消息监控指标
```java
@Component
public class MQMonitor {

    @Autowired
    private RocketMQTemplate rocketMQTemplate;

    public Map<String, Object> getMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // 获取消费组信息
        ConsumerRunningInfo info = rocketMQTemplate.getConsumerRunningInfo();

        metrics.put("consume_from_where", info.getConsumeFromWhere());
        metrics.put("message_total", info.getMsgTotal());
        metrics.put("msgtps", info.getMsgTPS());
        metrics.put("broker_addr", info.getBrokerAddr());

        return metrics;
    }
}
```

### 11.2 运维脚本
```bash
#!/bin/bash
# 查看消费状态
mqadmin consumerList -n localhost:9876 -g seckill-consumer-group

# 查看消息堆积
mqadmin topicStatus -n localhost:9876 -t seckill-topic

# 查询消息
mqadmin queryMsgById -n localhost:9876 -i 123456

# 重置消费进度
mqadmin resetOffsetByTime -n localhost:9876 -g seckill-consumer-group -t seckill-topic -s 2024-01-01 00:00:00
```

## 12. 最佳实践

### 12.1 消息设计原则
1. **消息内容简洁**：避免传输大对象
2. **使用合理的事务级别**：根据业务选择同步或异步
3. **设置合理的TTL**：避免消息堆积
4. **实现幂等处理**：防止重复消费

### 12.2 性能调优建议
1. **合理设置线程数**：根据机器性能调整
2. **使用批量处理**：减少网络开销
3. **监控消息堆积**：及时处理异常情况
4. **优化消息路由**：避免热点问题

### 12.3 故障处理
1. **消息发送失败**：实现重试机制
2. **消息消费失败**：记录日志并通知人工
3. **消息丢失**：通过持久化和确认机制保证
4. **消息重复**：通过唯一ID实现幂等

---

[返回文档首页](../README.md) | [上一篇：分库分表详解](./sharding.md) | [下一篇：限流降级详解](./rate-limiting.md)

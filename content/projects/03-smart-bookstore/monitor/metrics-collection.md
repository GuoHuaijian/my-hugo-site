# 指标采集详解

## 指标类型

### Counter（计数器）
只能增加，适用于计数类指标。

```java
@Autowired
private MeterRegistry meterRegistry;

// HTTP 请求计数
Counter httpRequestsCounter = Counter
    .builder("http.server.requests")
    .description("HTTP服务器请求总数")
    .tag("method", "GET")
    .tag("endpoint", "/api/seckill")
    .register(meterRegistry);
httpRequestsCounter.increment();

// 秒杀请求计数
Counter seckillRequestsCounter = Counter
    .builder("seckill.requests.total")
    .description("秒杀请求数")
    .tag("status", "success")
    .register(meterRegistry);
seckillRequestsCounter.increment();
```

### Gauge（仪表盘）
可增可减，适用于当前值。

```java
// 库存水平
AtomicInteger stockLevel = new AtomicInteger(0);
Gauge gauge = Gauge
    .builder("inventory.stock.level", stockLevel, AtomicInteger::get)
    .description("库存水平")
    .tag("product", "book-001")
    .register(meterRegistry);

// 更新库存
stockLevel.set(100);
```

### Timer（计时器）
记录耗时和频率。

```java
// 秒杀接口耗时
Timer seckillTimer = Timer
    .builder("seckill.request.duration")
    .description("秒杀请求耗时")
    .tag("endpoint", "/api/seckill")
    .publishPercentiles(0.5, 0.95, 0.99)
    .register(meterRegistry);

// 计时
seckillTimer.record(() -> doSeckill(request));
```

### DistributionSummary（分布摘要）
记录事件分布。

```java
// 订单金额分布
DistributionSummary orderAmountSummary = DistributionSummary
    .builder("order.amount.distribution")
    .description("订单金额分布")
    .baseUnit("yuan")
    .publishPercentiles(0.5, 0.75, 0.9, 0.99)
    .register(meterRegistry);

orderAmountSummary.record(99.00);
```

## Prometheus 集成

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
    tags:
      application: ${spring.application.name}
```

## 自定义指标

```java
@Component
public class CustomMetrics {

    private final Counter seckillSuccessCounter;
    private final Counter seckillFailCounter;
    private final Timer seckillTimer;

    public CustomMetrics(MeterRegistry registry) {
        this.seckillSuccessCounter = Counter
            .builder("seckill.success.total")
            .description("秒杀成功次数")
            .register(registry);
        this.seckillFailCounter = Counter
            .builder("seckill.fail.total")
            .description("秒杀失败次数")
            .register(registry);
        this.seckillTimer = Timer
            .builder("seckill.processing.time")
            .description("秒杀处理耗时")
            .register(registry);
    }

    public void recordSuccess() {
        seckillSuccessCounter.increment();
    }

    public void recordFail() {
        seckillFailCounter.increment();
    }

    public <T> T recordProcessing(Supplier<T> supplier) {
        return seckillTimer.record(supplier);
    }
}
```

## 关键监控指标

| 类别 | 指标 | 说明 |
|------|------|------|
| HTTP | `http.server.requests` | 请求总数和耗时 |
| JVM | `jvm.memory.used` | 堆内存使用 |
| JVM | `jvm.gc.pause` | GC 暂停时间 |
| 业务 | `seckill.requests.total` | 秒杀请求量 |
| 业务 | `order.processing.time` | 订单处理耗时 |
| DB | `db.connections.active` | 数据库连接数 |
| Redis | `redis.cache.hit.rate` | 缓存命中率 |

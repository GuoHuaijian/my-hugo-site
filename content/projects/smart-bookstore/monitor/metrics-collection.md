---
title: "📊 指标采集详解"
description: "监控系统指标类型、采集配置和自定义指标开发"
date: 2024-01-01
showTableOfContents: true
weight: 1
---

# 📊 指标采集详解

## 📝 指标类型

### 1. Counter（计数器）
计数器只能增加，不能减少，适用于计数类指标。

#### 使用场景
- HTTP请求数
- 错误计数
- 消息处理数量
- 业务事件计数

#### 代码示例
```java
// 使用Micrometer创建Counter
@Autowired
private MeterRegistry meterRegistry;

// 记录HTTP请求
Counter httpRequestsCounter = Counter
    .builder("http.server.requests")
    .description("HTTP服务器请求总数")
    .tag("method", "GET")
    .tag("endpoint", "/api/seckill")
    .register(meterRegistry);

httpRequestsCounter.increment();

// 记录秒杀请求数
Counter seckillRequestsCounter = Counter
    .builder("seckill.requests.total")
    .description("秒杀请求数")
    .tag("status", "success")  // success | failed
    .register(meterRegistry);

seckillRequestsCounter.increment();
```

#### Prometheus格式
```promql
# HTTP请求总数
http_server_requests_total{method="GET", endpoint="/api/seckill"}

# 秒杀请求数
seckill_requests_total{status="success"}
```

### 2. Gauge（仪表盘）
仪表盘可以任意增减，适用于瞬时值指标。

#### 使用场景
- CPU使用率
- 内存使用率
- 活跃连接数
- 当前队列大小

#### 代码示例
```java
// 记录当前活跃用户数
Gauge activeUsersGauge = Gauge
    .builder("application.users.active")
    .description("当前活跃用户数")
    .register(meterRegistry, this, SmartMonitor::getActiveUserCount);

// 记录库存水平
Gauge stockGauge = Gauge
    .builder("inventory.stock.level")
    .description("库存水平")
    .tag("product_id", "${productId}")
    .register(meterRegistry, this, SmartMonitor::getStockLevel);
```

#### Prometheus格式
```promql
# 当前活跃用户数
application_users_active

# 库存水平
inventory_stock_level{product_id="1001"}
```

### 3. Timer（计时器）
计时器用于测量耗时，结合了Counter和Histogram。

#### 使用场景
- 请求响应时间
- 数据库查询耗时
- 方法执行时间
- 消息处理耗时

#### 代码示例
```java
@Autowired
private MeterRegistry meterRegistry;

// 记录秒杀处理时间
Timer seckillTimer = Timer
    .builder("seckill.processing.time")
    .description("秒杀处理时间")
    .tag("status", "success")
    .register(meterRegistry);

public void processSeckillRequest(SeckillRequest request) {
    seckillTimer.record(() -> {
        // 秒杀业务逻辑
        doSeckill(request);
    });
}

// 使用注解（Spring Boot Actuator）
@Timed(value = "order.processing.time",
      description = "订单处理时间",
      extraTags = {"status", "success"})
public Order processOrder(OrderRequest request) {
    // 订单处理逻辑
    return createOrder(request);
}
```

#### Prometheus格式
```promql
# 秒杀处理时间（秒）
seckill_processing_time_seconds_sum{status="success"}
seckill_processing_time_seconds_count{status="success"}
seckill_processing_time_seconds_bucket{le="0.1", status="success"}
```

### 4. DistributionSummary（分布摘要）
用于记录分布数据，类似于Timer但不记录时间。

#### 使用场景
- 消息大小
- 请求大小
- 处理结果数量

#### 代码示例
```java
// 记录订单金额
DistributionSummary orderAmountSummary = DistributionSummary
    .builder("order.amount")
    .description("订单金额分布")
    .register(meterRegistry);

public void createOrder(OrderRequest request) {
    Order order = createOrderInternal(request);
    orderAmountSummary.record(order.getAmount());
}
```

## 📋 采集配置

### 1. 基础配置

#### application.yml
```yaml
bookstore:
  monitor:
    metrics:
      # 指标采集间隔（毫秒）
      interval: 10000
      # 启用指标采集
      enabled: true
      # 是否启用JVM指标
      jvm: true
      # 是否启用系统指标
      system: true
      # 是否启用HTTP指标
      http: true

    # 指标导出配置
    export:
      prometheus:
        enabled: true
        host: 0.0.0.0
        port: 8080
        path: /actuator/prometheus

      # 日志输出配置
      logging:
        enabled: true
        format: "json"
        level: "INFO"
```

#### 自定义指标配置
```yaml
bookstore:
  monitor:
    custom:
      # 业务指标
      business:
        enabled: true
        include:
          - "seckill.*"
          - "order.*"
          - "payment.*"
        exclude:
          - "seckill.internal.*"

      # 指标标签
      tags:
        application: "bookstore-smart"
        environment: "production"
        region: "cn-east-1"
```

### 2. Prometheus采集配置

#### prometheus.yml
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'bookstore-monitor'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/actuator/prometheus'
    scrape_interval: 10s
    scrape_timeout: 5s

    # 自定义标签
    labels:
      application: 'bookstore-smart'
      environment: 'production'

    # metric_relabel_configs
    metric_relabel_configs:
      - source_labels: [__name__]
        regex: 'seckill_(requests|orders)_total'
        replacement: '$1'
        target_label: 'metric_group'

    # relabel_configs
    relabel_configs:
      - source_labels: [__address__]
        regex: '(.*):8080'
        replacement: '$1:9090'
        target_label: 'instance'
```

### 3. 高级配置

#### 指数直方图配置
```yaml
bookstore:
  monitor:
    histogram:
      # 启用指数直方图
      exponential: true
      # 最小值
      min: 0.001
      # 最大值
      max: 100.0
      # 分桶数量
      buckets: 20

      # 预定义分桶
      predefined-buckets:
        - 0.1
        - 0.5
        - 1.0
        - 5.0
        - 10.0
        - 50.0
        - 100.0
```

#### 采样配置
```yaml
bookstore:
  monitor:
    sampling:
      # 采样率（0.0-1.0）
      rate: 1.0
      # 采样策略
      strategy: "random"
      # 是否采样慢请求
      slow-request:
        enabled: true
        threshold: 1000  # 毫秒
        rate: 0.1  # 慢请求采样率
```

## 🚀 自定义指标开发

### 1. 基础自定义指标

#### 业务指标收集器
```java
@Component
public class BusinessMetricsCollector {

    private final MeterRegistry meterRegistry;

    @Autowired
    public BusinessMetricsCollector(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    // 初始化指标
    @PostConstruct
    public void initMetrics() {
        // 计数器
        Counter seckillCounter = Counter.builder("seckill.requests.total")
            .description("秒杀请求数")
            .tags("status", "total")
            .register(meterRegistry);

        // 仪表盘
        Gauge activeUsers = Gauge.builder("application.users.active")
            .description("当前活跃用户数")
            .register(meterRegistry, this, BusinessMetricsCollector::getActiveUserCount);

        // 计时器
        Timer seckillTimer = Timer.builder("seckill.processing.time")
            .description("秒杀处理时间")
            .register(meterRegistry);
    }

    // 记录秒杀请求
    public void recordSeckillRequest(String status, long duration) {
        Counter counter = Counter.builder("seckill.requests.total")
            .tag("status", status)
            .register(meterRegistry);
        counter.increment();

        Timer timer = Timer.builder("seckill.processing.time")
            .tag("status", status)
            .register(meterRegistry);
        timer.record(duration, TimeUnit.MILLISECONDS);
    }

    // 获取活跃用户数
    private double getActiveUserCount() {
        return userService.getActiveUserCount();
    }
}
```

#### 健康检查指标
```java
@Component
public class HealthCheckMetrics implements HealthIndicator {

    @Override
    public Health health() {
        // 检查数据库连接
        if (checkDatabase()) {
            // 添加自定义指标
            Gauge.builder("database.health.status")
                .description("数据库健康状态")
                .tag("status", "up")
                .register(meterRegistry);

            return Health.up().build();
        }

        Gauge.builder("database.health.status")
            .description("数据库健康状态")
            .tag("status", "down")
            .register(meterRegistry);

        return Health.down()
            .withDetail("error", "Database connection failed")
            .build();
    }

    private boolean checkDatabase() {
        try {
            jdbcTemplate.execute("SELECT 1");
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
```

### 2. 复杂自定义指标

#### 分布式事务指标
```java
@Component
public class TransactionMetrics {

    private final MeterRegistry meterRegistry;
    private final Counter transactionCounter;
    private final Timer transactionTimer;
    private final Gauge activeTransactionsGauge;

    @Autowired
    public TransactionMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;

        // 初始化指标
        this.transactionCounter = Counter.builder("transactions.total")
            .description("事务总数")
            .tags("type", "seata")
            .register(meterRegistry);

        this.transactionTimer = Timer.builder("transactions.duration")
            .description("事务耗时")
            .tags("type", "seata")
            .register(meterRegistry);

        this.activeTransactionsGauge = Gauge.builder("transactions.active")
            .description("活跃事务数")
            .register(meterRegistry, this, TransactionMetrics::getActiveTransactionCount);
    }

    // 记录事务开始
    public void beginTransaction(String xid) {
        transactionCounter.increment();
    }

    // 记录事务提交
    public void commitTransaction(String xid, long duration) {
        transactionTimer.record(duration, TimeUnit.MILLISECONDS);
    }

    // 记录事务回滚
    public void rollbackTransaction(String xid, long duration) {
        Timer rollbackTimer = Timer.builder("transactions.duration")
            .tag("type", "seata")
            .tag("status", "rollback")
            .register(meterRegistry);
        rollbackTimer.record(duration, TimeUnit.MILLISECONDS);
    }

    // 获取活跃事务数
    private double getActiveTransactionCount() {
        return transactionManager.getActiveTransactionCount();
    }
}
```

#### 缓存监控指标
```java
@Component
public class CacheMetrics {

    private final MeterRegistry meterRegistry;

    @Autowired
    public CacheMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    // Redis缓存指标
    @EventListener
    public void onRedisEvent(RedisEvent event) {
        if (event instanceof RedisCacheHitEvent) {
            hitRateCounter("redis", "hit").increment();
        } else if (event instanceof RedisCacheMissEvent) {
            hitRateCounter("redis", "miss").increment();
        }
    }

    // 本地缓存指标
    @Cacheable(value = "users", key = "#id")
    public User getUser(Long id) {
        return userRepository.findById(id);
    }

    // 记录缓存操作
    private Counter hitRateCounter(String cacheType, String operation) {
        return Counter.builder("cache.operations")
            .description("缓存操作次数")
            .tag("type", cacheType)
            .tag("operation", operation)
            .register(meterRegistry);
    }

    // 缓存命中率统计
    @Scheduled(fixedRate = 60000)  // 每分钟执行
    public void reportCacheHitRate() {
        double hitRate = calculateHitRate();
        Gauge.builder("cache.hit.rate")
            .description("缓存命中率")
            .tag("cache", "redis")
            .register(meterRegistry, hitRate);
    }

    private double calculateHitRate() {
        long hits = meterRegistry.get("cache.operations")
            .tag("type", "redis")
            .tag("operation", "hit")
            .counter()
            .count();

        long misses = meterRegistry.get("cache.operations")
            .tag("type", "redis")
            .tag("operation", "miss")
            .counter()
            .count();

        long total = hits + misses;
        return total == 0 ? 0 : (double) hits / total;
    }
}
```

### 3. 指标优化策略

#### 批量采集
```java
@Component
public class BatchMetricsCollector {

    private final MeterRegistry meterRegistry;
    private final List<Metric> pendingMetrics = new ArrayList<>();
    private final ScheduledExecutorService scheduler;

    @Autowired
    public BatchMetricsCollector(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.scheduler = Executors.newScheduledThreadPool(1);

        // 每5秒批量提交
        scheduler.scheduleAtFixedRate(this::submitPendingMetrics,
            5, 5, TimeUnit.SECONDS);
    }

    // 批量记录指标
    public void recordMetric(Metric metric) {
        synchronized (pendingMetrics) {
            pendingMetrics.add(metric);
        }
    }

    // 提交待处理指标
    private void submitPendingMetrics() {
        synchronized (pendingMetrics) {
            if (!pendingMetrics.isEmpty()) {
                for (Metric metric : pendingMetrics) {
                    meterRegistry(metric);
                }
                pendingMetrics.clear();
            }
        }
    }

    // 关闭资源
    @PreDestroy
    public void destroy() {
        scheduler.shutdown();
    }
}
```

#### 指标采样
```java
@Component
public class SamplingMetricsInterceptor implements MethodInterceptor {

    private final MeterRegistry meterRegistry;
    private final Random random = new Random();
    private final double sampleRate;

    public SamplingMetricsInterceptor(MeterRegistry meterRegistry, double sampleRate) {
        this.meterRegistry = meterRegistry;
        this.sampleRate = sampleRate;
    }

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        // 采样判断
        if (random.nextDouble() > sampleRate) {
            return invocation.proceed();
        }

        long start = System.currentTimeMillis();
        try {
            return invocation.proceed();
        } finally {
            long duration = System.currentTimeMillis() - start;
            recordSampledMetric(invocation.getMethod().getName(), duration);
        }
    }

    private void recordSampledMetric(String methodName, long duration) {
        Timer.builder("method.execution.time")
            .description("方法执行时间")
            .tag("method", methodName)
            .register(meterRegistry)
            .record(duration, TimeUnit.MILLISECONDS);
    }
}
```

## 📊 监控指标清单

### 系统指标
| 指标名称 | 类型 | 描述 | 标签 |
|---------|------|------|------|
| `system.cpu.usage` | Gauge | CPU使用率 | mode="user|system|iowait" |
| `system.memory.usage` | Gauge | 内存使用率 | type="used|free|cached" |
| `system.disk.usage` | Gauge | 磁盘使用率 | device="/dev/sda1" |
| `system.network.bytes.in` | Counter | 网络入字节数 | device="eth0" |

### 应用指标
| 指标名称 | 类型 | 描述 | 标签 |
|---------|------|------|------|
| `http.server.requests` | Counter | HTTP请求数 | method="GET|POST", status="200|500" |
| `jvm.memory.heap.used` | Gauge | JVM堆内存使用量 | area="heap" |
| `jvm.gc.pause` | Timer | GC暂停时间 | cause="Young|Old" |

### 业务指标
| 指标名称 | 类型 | 描述 | 标签 |
|---------|------|------|------|
| `seckill.requests.total` | Counter | 秒杀请求数 | status="success|failed" |
| `order.processing.time` | Timer | 订单处理时间 | status="success|failed" |
| `payment.success.rate` | Gauge | 支付成功率 | method="alipay|wechat" |

### 数据库指标
| 指标名称 | 类型 | 描述 | 标签 |
|---------|------|------|------|
| `db.connections.active` | Gauge | 活跃连接数 | pool="hikari" |
| `db.query.time` | Timer | 查询耗时 | type="select|insert|update" |

---

> 💡 **提示**：合理的指标采集配置是监控系统高效运行的基础。建议根据业务需求选择合适的指标类型，避免过度采集导致性能问题。
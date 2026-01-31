---
title: "可观测性详解"
description: "智慧书店项目技术文档 - 可观测性详解"
date: 2024-01-01
weight: 12
difficulty: 3
readTime: 30
keywords: ['可观测性', '链路追踪', '监控', '日志']
---

# 可观测性详解

> 链路追踪、日志规范、监控体系

## 1. 可观测性概述

### 1.1 什么是可观测性
可观测性是指通过外部观察系统的输出，来理解系统内部状态的能力。主要包括三个核心要素：
- **Metrics（指标）**：数值型数据，用于系统监控
- **Logs（日志）**：离散事件，用于问题排查
- **Traces（追踪）**：请求链路，用于性能分析

### 1.2 为什么需要可观测性
在分布式系统中，由于：
- 服务数量众多
- 调用链路复杂
- 故障难以复现
- 性能瓶颈难以定位

可观测性帮助我们：
- 快速定位问题
- 分析系统性能
- 预防故障发生
- 优化系统架构

## 2. SkyWalking 配置

### 2.1 添加依赖
```xml
<dependency>
    <groupId>org.apache.skywalking</groupId>
    <artifactId>apm-toolkit-trace</artifactId>
    <version>8.10.0</version>
</dependency>
<dependency>
    <groupId>org.apache.skywalking</groupId>
    <artifactId>apm-toolkit-log-back-1.x</artifactId>
    <version>8.10.0</version>
</dependency>
```

### 2.2 配置文件
```yaml
# skywalking.yml
agent:
  service_name: ${spring.application.name}
  service_instance_name: ${spring.cloud.client.hostname}:${server.port}
  collector:
    backend_service:
      host: oap-server
      port: 11800
      grpc: # grpc方式，推荐使用
        host: oap-server
        port: 11800
  sampling:
    # 采样率
    period: 1000
    step: 1
    percentage: 100 # 100%采样
```

### 2.3 网关配置
```java
@Component
public class TraceFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // 生成TraceID
        String traceId = UUID.randomUUID().toString().replace("-", "");

        // 将TraceID放入请求头
        ServerHttpRequest request = exchange.getRequest().mutate()
                .header("X-Trace-Id", traceId)
                .header("X-Span-Id", traceId)
                .build();

        // 创建新的交换机
        ServerWebExchange newExchange = exchange.mutate()
                .request(request)
                .build();

        // 设置MDC上下文
        MDC.put("traceId", traceId);
        MDC.put("spanId", traceId);

        try {
            // 继续过滤器链
            return chain.filter(newExchange);
        } finally {
            // 清理MDC
            MDC.remove("traceId");
            MDC.remove("spanId");
        }
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
```

## 3. 链路追踪实现

### 3.1 自定义标签
```java
@Component
public class CustomTagsInjector implements AbstractSpan.TagsInjector<ServerWebExchange> {

    @Override
    public void injectTags(AbstractSpan span, ServerWebExchange exchange) {
        // 添加自定义标签
        span.tag("userId", exchange.getRequest().getHeaders().getFirst("X-User-Id"));
        span.tag("userAgent", exchange.getRequest().getHeaders().getFirst("User-Agent"));
        span.tag("clientIp", exchange.getRequest().getRemoteAddress().getAddress().getHostAddress());

        // 添加业务标签
        span.tag("url", exchange.getRequest().getPath().value());
        span.tag("method", exchange.getRequest().getMethodValue());
    }
}
```

### 3.2 手动创建Span
```java
@Service
public class OrderService {

    @Autowired
    private Tracer tracer;

    public Order createOrder(Order order) {
        // 创建子Span
        ScopedSpan span = tracer.nextSpan().name("createOrder").start();

        try (ActiveSpan aSpan = span.makeCurrent()) {
            // 设置标签
            span.tag("userId", order.getUserId().toString());
            span.tag("amount", order.getTotalAmount().toString());

            // 业务逻辑
            Order result = doCreateOrder(order);

            // 设置事件
            span.log("订单创建成功");

            return result;

        } catch (Exception e) {
            // 记录错误
            span.error(e);
            throw e;
        } finally {
            // 结束Span
            span.finish();
        }
    }
}
```

### 3.3 异步追踪
```java
@Service
public class AsyncService {

    @Autowired
    private Tracer tracer;

    @Async
    public CompletableFuture<Order> processOrderAsync(Order order) {
        // 继承父Span的上下文
        CurrentContext context = CurrentContext.getContext();
        Span span = context.getSpan();

        ScopedSpan childSpan = tracer.nextSpan(span)
                .name("processOrderAsync")
                .start();

        try (ActiveSpan aSpan = childSpan.makeCurrent()) {
            // 异步处理
            Order result = doAsyncProcess(order);

            childSpan.log("异步处理完成");
            return CompletableFuture.completedFuture(result);

        } finally {
            childSpan.finish();
        }
    }
}
```

## 4. 日志规范

### 4.1 日志配置
```xml
<!-- logback-spring.xml -->
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] [%X{traceId}] [%X{spanId}] [%level] [%logger] - %msg%n</pattern>
        </encoder>
    </appender>

    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/spring-boot-app.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/spring-boot-app.%d{yyyy-MM-dd}.log.%i</fileNamePattern>
            <maxFileSize>50MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>1GB</totalSizeCap>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] [%X{traceId}] [%X{spanId}] [%level] [%logger] - %msg%n</pattern>
        </encoder>
    </appender>

    <logger name="com.bookstore" level="INFO" additivity="false">
        <appender-ref ref="STDOUT"/>
        <appender-ref ref="FILE"/>
    </logger>
</configuration>
```

### 4.2 日志模板
```java
@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    public Order createOrder(Order order) {
        // 入口日志
        logger.info("开始创建订单, userId={}, amount={}",
            order.getUserId(), order.getTotalAmount());

        try {
            // 业务处理
            Order result = doCreateOrder(order);

            // 出口日志
            logger.info("订单创建成功, orderId={}, traceId={}",
                result.getId(), TraceContext.getTraceId());

            return result;

        } catch (Exception e) {
            // 异常日志
            logger.error("创建订单失败, userId={}, traceId={}, error={}",
                order.getUserId(), TraceContext.getTraceId(), e.getMessage(), e);
            throw e;
        }
    }
}
```

### 4.3 结构化日志
```java
@Service
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    public ProductDTO getProductDetail(Long productId) {
        // 使用JSON格式记录结构化日志
        String traceId = TraceContext.getTraceId();

        Map<String, Object> logData = new HashMap<>();
        logData.put("traceId", traceId);
        logData.put("event", "getProductDetail");
        logData.put("productId", productId);
        logData.put("timestamp", System.currentTimeMillis());

        logger.info("查询商品详情: {}", JSON.toJSONString(logData));

        try {
            Product product = productMapper.selectById(productId);

            logData.put("status", "success");
            logData.put("productName", product.getName());
            logger.info("查询商品详情完成: {}", JSON.toJSONString(logData));

            return convertToDTO(product);

        } catch (Exception e) {
            logData.put("status", "error");
            logData.put("errorMessage", e.getMessage());
            logger.error("查询商品详情失败: {}", JSON.toJSONString(logData), e);
            throw e;
        }
    }
}
```

## 5. 监控指标体系

### 5.1 JVM监控
```java
@Component
public class JvmMetrics {

    private final MeterRegistry meterRegistry;

    @Autowired
    public JvmMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        registerJvmMetrics();
    }

    private void registerJvmMetrics() {
        // JVM内存使用率
        Gauge.builder("jvm.memory.used", Runtime.getRuntime(), Runtime::totalMemory)
            .tags("type", "total")
            .register(meterRegistry);

        // JVM线程数
        Gauge.builder("jvm.thread.count", Thread::activeCount)
            .register(meterRegistry);

        // JVM GC次数
        new JvmMemoryMetrics().bindTo(meterRegistry);
        new JvmGcMetrics().bindTo(meterRegistry);
    }
}
```

### 5.2 业务指标
```java
@Component
public class BusinessMetrics {

    private final MeterRegistry meterRegistry;
    private final Counter seckillCounter;
    private final Timer seckillTimer;

    @Autowired
    public BusinessMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.seckillCounter = Counter.builder("seckill.request.count")
            .description("秒杀请求计数")
            .register(meterRegistry);

        this.seckillTimer = Timer.builder("seckill.request.duration")
            .description("秒杀请求耗时")
            .register(meterRegistry);
    }

    public void recordSeckillRequest(Long productId, boolean success) {
        // 记录计数
        seckillCounter.increment(
            Tags.of("productId", productId.toString())
                .and("success", String.valueOf(success))
        );

        // 记录耗时
        seckillTimer.record(() -> {
            // 业务逻辑
        });
    }
}
```

### 5.3 自定义指标
```java
@Component
public class CustomMetrics {

    private final MeterRegistry meterRegistry;

    @Autowired
    public CustomMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    /**
     * 记录订单状态转换
     */
    public void recordOrderStatusTransition(String fromStatus, String toStatus) {
        meterRegistry.gauge("order.status.transition",
            Tags.of("from", fromStatus, "to", toStatus),
            1
        );
    }

    /**
     * 记录库存变化
     */
    public void recordStockChange(Long productId, int change) {
        meterRegistry.gauge("inventory.change",
            Tags.of("productId", productId.toString()),
            change
        );
    }

    /**
     * 记录错误率
     */
    public void recordErrorRate(String service, double errorRate) {
        Gauge.builder("service.error.rate", errorRate)
            .tags("service", service)
            .register(meterRegistry);
    }
}
```

## 6. 告警配置

### 6.1 告警规则
```yaml
# alert-rules.yml
groups:
  - name: seckill-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "服务错误率过高"
          description: "{{ $labels.service }} 在 {{ $value }} 的请求中遇到5xx错误"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "服务响应延迟过高"
          description: "{{ $labels.service }} 的95%请求延迟超过1秒"

      - alert: MemoryUsageHigh
        expr: (jvm_memory_used{area="heap"} / jvm_memory_max{area="heap"}) > 0.8
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "内存使用率过高"
          description: "Heap内存使用率超过80%"
```

### 6.2 告警通知
```java
@Component
public class AlertManager {

    @Autowired
    private AlertService alertService;

    @Scheduled(fixedRate = 30000) // 30秒检查一次
    public void checkAlerts() {
        // 检查错误率
        double errorRate = calculateErrorRate();
        if (errorRate > 0.1) {
            sendAlert("HIGH_ERROR_RATE", "服务错误率过高: " + errorRate);
        }

        // 检查响应时间
        double avgLatency = calculateAvgLatency();
        if (avgLatency > 1000) {
            sendAlert("HIGH_LATENCY", "响应延迟过高: " + avgLatency + "ms");
        }

        // 检查内存使用
        double memoryUsage = getMemoryUsage();
        if (memoryUsage > 0.8) {
            sendAlert("HIGH_MEMORY", "内存使用率过高: " + (memoryUsage * 100) + "%");
        }
    }

    private void sendAlert(String type, String message) {
        Alert alert = new Alert();
        alert.setType(type);
        alert.setMessage(message);
        alert.setTimestamp(System.currentTimeMillis());
        alert.setSeverity(Severity.HIGH);

        alertService.send(alert);
    }
}
```

## 7. 性能分析

### 7.1 慢查询分析
```java
@Component
public class SlowQueryAnalyzer {

    @Autowired
    private Tracer tracer;

    @Autowired
    private MeterRegistry meterRegistry;

    /**
     * 记录慢查询
     */
    public void recordSlowQuery(String sql, long executionTime) {
        if (executionTime > 1000) { // 超过1秒认为是慢查询
            // 记录指标
            meterRegistry.gauge("sql.slow.query.count", 1);

            // 记录日志
            logger.warn("慢查询检测 - SQL: {}, 执行时间: {}ms, TraceId: {}",
                sql, executionTime, TraceContext.getTraceId());
        }
    }

    /**
     * 分析查询性能
     */
    @Scheduled(fixedRate = 60000) // 每分钟分析一次
    public void analyzeQueryPerformance() {
        // 获取慢查询列表
        List<SlowQuery> slowQueries = getSlowQueries();

        // 分析最慢的查询
        slowQueries.stream()
            .sorted(Comparator.comparingLong(SlowQuery::getExecutionTime).reversed())
            .limit(10)
            .forEach(query -> {
                logger.warn("性能TOP10 - SQL: {}, 执行时间: {}ms, 执行次数: {}",
                    query.getSql(), query.getExecutionTime(), query.getCount());
            });
    }
}
```

### 7.2 调用链分析
```java
@Service
public class TraceAnalyzer {

    @Autowired
    private SkyWalkingClient skyWalkingClient;

    /**
     * 分析调用链
     */
    public TraceAnalysis analyzeTrace(String traceId) {
        TraceAnalysis analysis = new TraceAnalysis();
        analysis.setTraceId(traceId);

        // 获取调用链数据
        Trace trace = skyWalkingClient.getTrace(traceId);
        if (trace == null) {
            return analysis;
        }

        // 分析每个Span
        List<Span> spans = trace.getSpans();
        long totalDuration = trace.getDuration();

        // 找到最耗时的Span
        Span slowestSpan = spans.stream()
            .max(Comparator.comparingLong(Span::getDuration))
            .orElse(null);

        // 计算各阶段耗时占比
        Map<String, Double> durationRatio = spans.stream()
            .collect(Collectors.toMap(
                Span::getOperationName,
                s -> (double) s.getDuration() / totalDuration
            ));

        analysis.setTotalDuration(totalDuration);
        analysis.setSlowestSpan(slowestSpan);
        analysis.setDurationRatio(durationRatio);

        return analysis;
    }

    /**
     * 生成性能报告
     */
    public PerformanceReport generatePerformanceReport(String traceId) {
        TraceAnalysis analysis = analyzeTrace(traceId);

        PerformanceReport report = new PerformanceReport();
        report.setTraceId(traceId);
        report.setTotalDuration(analysis.getTotalDuration());

        // 添加关键性能指标
        report.addMetric("SlowestOperation",
            analysis.getSlowestSpan() != null ? analysis.getSlowestSpan().getOperationName() : "N/A");
        report.addMetric("SlowestDuration",
            analysis.getSlowestSpan() != null ? analysis.getSlowestSpan().getDuration() : 0);

        // 添加各阶段占比
        analysis.getDurationRatio().forEach((operation, ratio) -> {
            report.addMetric(operation + "Ratio", ratio * 100);
        });

        return report;
    }
}
```

## 8. 日志聚合与分析

### 8.1 ELK 配置
```yaml
# docker-compose.yml
version: '3'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"

  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    ports:
      - "5601:5601"
```

### 8.2 Logstash 配置
```ruby
# logstash.conf
input {
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  if [type] == "java" {
    grok {
      match => { "message" => "(?<timestamp>%{DATE:yyyy-MM-dd HH:mm:ss.SSS}) \[%{WORD:thread}\] \[%{DATA:traceId}\] \[%{DATA:spanId}\] \[%{WORD:level}\] \[%{DATA:logger}\] - (?<message>.*)" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "bookstore-logs-%{+YYYY.MM.dd}"
  }
}
```

### 8.3 Kibana 仪表板
```json
{
  "dashboard": {
    "title": "BookStore 秒杀系统监控",
    "panels": [
      {
        "type": "visualization",
        "visConfig": {
          "type": "timeseries",
          "aggs": [
            {
              "id": "1",
              "type": "avg",
              "field": "service.response_time"
            }
          ]
        }
      },
      {
        "type": "visualization",
        "visConfig": {
          "type": "pie",
          "aggs": [
            {
              "id": "2",
              "type": "count",
              "field": "log.level"
            }
          ]
        }
      }
    ]
  }
}
```

## 9. 容器化监控

### 9.1 Prometheus 配置
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'bookstore'
    static_configs:
      - targets: ['bookstore-gateway:8000', 'bookstore-seckill:8050']
        labels:
          service: 'bookstore'
          version: '1.0.0'

  - job_name: 'docker'
    static_configs:
      - targets: ['cadvisor:8080']
```

### 9.2 容器指标采集
```java
@Component
public class ContainerMetrics {

    private final MeterRegistry meterRegistry;

    @Autowired
    public ContainerMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        registerContainerMetrics();
    }

    private void registerContainerMetrics() {
        // 容器CPU使用率
        Gauge.builder("container.cpu.usage", this::getCpuUsage)
            .register(meterRegistry);

        // 容器内存使用率
        Gauge.builder("container.memory.usage", this::getMemoryUsage)
            .register(meterRegistry);

        // 容器网络IO
        Gauge.builder("container.network.bytes_in", this::getNetworkIn)
            .register(meterRegistry);

        Gauge.builder("container.network.bytes_out", this::getNetworkOut)
            .register(meterRegistry);
    }

    private double getCpuUsage() {
        // 通过Docker API获取CPU使用率
        return getDockerMetric("/stats", "cpu_stats", "cpu_usage", "total_usage");
    }

    private double getMemoryUsage() {
        return getDockerMetric("/stats", "memory_stats", "usage");
    }

    private double getDockerMetric(String endpoint, String... path) {
        // 实现Docker API调用
        return 0.0;
    }
}
```

## 10. 最佳实践

### 10.1 命名规范
```
指标命名:
- 使用小写字母和下划线
- 包含业务信息：service.method.operation
- 示例：order.create.success, seckill.request.duration

标签命名:
- 使用小写字母
- 保持一致性
- 示例：method, status, product_id

日志格式:
- 时间 [线程] [TraceID] [SpanID] [级别] [类名] - 消息
- JSON格式的结构化日志
```

### 10.2 监控策略
1. **分级监控**：系统级、服务级、业务级
2. **阈值设定**：基于历史数据设定合理阈值
3. **告警收敛**：避免重复告警，设置冷却时间
4. **告警升级**：严重问题自动升级通知

### 10.3 故障排查
1. **定位问题**：通过TraceID快速定位
2. **分析性能**：查看调用链路分析
3. **查看日志**：按TraceID聚合日志
4. **监控趋势**：分析历史数据变化

### 10.4 持续优化
1. **定期审查**：定期审查监控规则
2. **完善指标**：新增关键业务指标
3. **优化告警**：提高告警准确率
4. **文档更新**：保持文档更新

---

[返回文档首页](../README.md) | [上一篇：限流降级详解](./rate-limiting.md)

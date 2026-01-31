---
title: "SkyWalking集成"
description: ""
date: 2024-01-01
showTableOfContents: true
weight: 1
---

# SkyWalking集成

## 概述

SkyWalking作为BookStore监控系统的链路追踪组件，提供了全链路追踪、性能分析和错误监控等功能。通过集成SkyWalking，我们可以深入了解服务间的调用关系，快速定位性能瓶颈和错误根源。

## 系统架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SkyWalking 集成架构                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   业务应用    │  │   探针      │  │   SkyWalking  │  │  监控系统    │   │
│  │(Application) │  │(Agent)      │  │(OAP Server) │  │(Monitor)   │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│           │             │             │             │                 │
│           └─────────────┼─────────────┼─────────────┘                 │
│                          │             │                              │
│                          ▼             ▼                              │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                数据采集与处理                               │     │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │     │
│  │  │  Jaeger格式  │ │  OpenTelemetry │ │  自定义协议   │          │     │
│  │  │  数据收集    │ │  兼容层     │ │  支持扩展    │          │     │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                          │             │                              │
│                          ▼             ▼                              │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │                   数据存储层                                │     │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │     │
│  │  │  H2存储     │ │  Elasticsearch│ │  MySQL      │          │     │
│  │  │  开发环境    │ │  生产环境    │ │  备份存储    │          │     │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │     │
│  └─────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

## 部署配置

### 1. SkyWalking OAP Server配置

#### 1.1 配置文件(application.yml)

```yaml
service:
  gRPC:
    port: 11800
  rest:
    host: 0.0.0.0
    port: 12800
  metrics:
    # 启用指标采集
    enableTaskMetrics: true
    # 存储模式
    selector: ${SW_STORAGE:elasticsearch}
  # 日志配置
  log:
    grpc:
      level: INFO
    rest:
      level: INFO

# 存储配置
storage:
  # Elasticsearch配置
  elasticsearch:
    name: Elasticsearch
    hosts:
      - http://localhost:9200
    user: ${SW_ES_USER:""}
    password: ${SW_ES_PASSWORD:""}
    index: oap
    indexShards: 5
    indexReplicas: 1
    bulkActions: 2000
    bulkSize: 20
    flushInterval: 10
    concurrentRequests: 30
    metadataQueryMaxSize: 5000

  # H2配置（开发环境）
  h2:
    url: jdbc:h2:./skywalking-oap-h2-db
    username: sa
    password: sa

# 探针配置
agent:
  service_name: ${SW_AGENT_NAME:BookStore}
  sample_n_100: ${SW_AGENT_SAMPLE_N_100:100}
  authENTICATION: ${SW_AGENT_AUTHENTICATION:""}
```

#### 1.2 Docker Compose部署

```yaml
version: '3.8'

services:
  oap:
    image: apache/skywalking-oap-server:9.3.0
    container_name: skywalking-oap
    ports:
      - "11800:11800"
      - "12800:12800"
    environment:
      SW_STORAGE: elasticsearch
      SW_ES_HOSTS: elasticsearch:9200
      SW_STORAGE_ELASTICSEARCH_CLUSTER_NODES: elasticsearch:9200
    depends_on:
      - elasticsearch
    networks:
      - skywalking

  elasticsearch:
    image: elasticsearch:7.17.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - es-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    networks:
      - skywalking

  ui:
    image: apache/skywalking-ui:9.3.0
    container_name: skywalking-ui
    ports:
      - "8080:8080"
    environment:
      SW_OAP_ADDRESS: oap:12800
    networks:
      - skywalking

volumes:
  es-data:

networks:
  skywalking:
    driver: bridge
```

### 2. 应用服务配置

#### 2.1 Spring Boot集成

```java
@Configuration
public class SkyWalkingConfig {

    @Value("${skywalking.oap.address}")
    private String oapAddress;

    @Bean
    public Tracing tracing() {
        return Tracing.newBuilder()
            .localServiceName("bookstore-service")
            .spanReporter(
                AsyncReporter.create(
                    HttpSender.newBuilder()
                        .endpoint(oapAddress + "/v3/trace")
                        .build()
                )
            )
            .currentTraceContext(
                ThreadLocalCurrentTraceContext.create()
            )
            .build();
    }

    @Bean
    public SkyWalkingMeterRegistry skyWalkingMeterRegistry(Tracing tracing) {
        return new SkyWalkingMeterRegistry(
            SkyWalkingConfig.DEFAULT,
            new Clock(),
            tracing
        );
    }
}
```

#### 2.2 微服务配置

```yaml
# application.yml
spring:
  application:
    name: bookstore-service

skywalking:
  oap:
    address: http://localhost:11800
    grpc:
      port: 11800
    rest:
      port: 12800

  # 采样配置
  sampling:
    percentage: 100
    rules:
      - service: "*"
        percentage: 100

  # 自定义标签
  tags:
    application: "bookstore"
    environment: "production"
    version: "1.0.0"
```

## 链路追踪使用

### 1. 基本用法

#### 1.1 手动创建Span

```java
import org.apache.skywalking.apm.toolkit.trace.Trace;
import org.apache.skywalking.apm.toolkit.trace.Tags;

@Service
public class OrderService {

    @Trace
    public Order createOrder(OrderRequest request) {
        // 创建子Span
        Span span = ContextManager.createLocalSpan("createOrder");

        try {
            span.setComponent("bookstore");
            span.setTag("order.type", request.getType());
            span.setTag("customer.id", request.getCustomerId());

            // 业务逻辑
            Order order = processOrder(request);

            span.setTag("order.id", order.getId());
            span.setTag("success", true);

            return order;
        } catch (Exception e) {
            span.errorOccurred();
            span.setTag("error", e.getMessage());
            throw e;
        } finally {
            span.asyncFinish();
        }
    }

    private Order processOrder(OrderRequest request) {
        Span processSpan = ContextManager.createLocalSpan("processOrder");
        try {
            // 处理订单
            return doProcess(request);
        } finally {
            processSpan.asyncFinish();
        }
    }
}
```

#### 1.2 自定义Tag

```java
public void customTrace() {
    Span span = ContextManager.createLocalSpan("customBusiness");

    try {
        // 添加自定义标签
        span.setTag("business.type", "order_payment");
        span.setTag("payment.method", "alipay");
        span.setTag("amount", 199.99);
        span.setTag("currency", "CNY");

        // 添加业务指标
        span.addTraceContext("transaction.id", UUID.randomUUID().toString());
        span.addTraceContext("user.id", "user123");

        // 执行业务逻辑
        executeBusinessLogic();

    } finally {
        span.asyncFinish();
    }
}
```

### 2. 数据库追踪

#### 2.1 MyBatis集成

```java
@Intercepts({
    @Signature(type= Executor.class, method="update",
        args={MappedStatement.class, Object.class}),
    @Signature(type= Executor.class, method="query",
        args={MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class})
})
public class SkyWalkingInterceptor implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        MappedStatement ms = (MappedStatement) invocation.getArgs()[0];
        String sqlId = ms.getId();

        Span span = ContextManager.createLocalSpan("SQL:" + sqlId);
        span.setComponent("database");
        span.setTag("db.type", "mysql");
        span.setTag("db.statement", sqlId);

        long startTime = System.currentTimeMillis();
        try {
            Object result = invocation.proceed();

            long duration = System.currentTimeMillis() - startTime;
            span.setTag("db.execution.duration", duration);

            return result;
        } catch (Exception e) {
            span.errorOccurred();
            span.setTag("error", e.getMessage());
            throw e;
        } finally {
            span.asyncFinish();
        }
    }
}
```

#### 2.2 Redis追踪

```java
import org.springframework.data.redis.core.RedisTemplate;

@Service
public class CacheService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Trace
    public void cacheData(String key, Object value) {
        Span span = ContextManager.createLocalSpan("redis.set");
        span.setComponent("redis");
        span.setTag("redis.key", key);

        try {
            redisTemplate.opsForValue().set(key, value);
            span.setTag("success", true);
        } catch (Exception e) {
            span.errorOccurred();
            span.setTag("error", e.getMessage());
            throw e;
        } finally {
            span.asyncFinish();
        }
    }

    @Trace
    public Object getCachedData(String key) {
        Span span = ContextManager.createLocalSpan("redis.get");
        span.setComponent("redis");
        span.setTag("redis.key", key);

        try {
            Object value = redisTemplate.opsForValue().get(key);
            span.setTag("found", value != null);
            return value;
        } catch (Exception e) {
            span.errorOccurred();
            span.setTag("error", e.getMessage());
            throw e;
        } finally {
            span.asyncFinish();
        }
    }
}
```

## 性能分析

### 1. 慢查询监控

#### 1.1 慢查询配置

```yaml
# slow-query-config.yml
skywalking:
  slowQuery:
    enabled: true
    threshold: 1000ms
    slowQueries:
      - pattern: "SELECT.*FROM.*orders.*WHERE.*"
        action: "alert"
      - pattern: "UPDATE.*inventory.*"
        action: "log"
      - pattern: "INSERT.*logs.*"
        action: "ignore"
```

#### 1.2 慢查询分析

```java
@Service
public class SlowQueryMonitor {

    @Scheduled(fixedRate = 30000)
    public void checkSlowQueries() {
        List<SlowQuery> slowQueries = getSlowQueries();

        for (SlowQuery query : slowQueries) {
            Span span = ContextManager.createLocalSpan("slow.query");
            span.setComponent("database");
            span.setTag("query", query.getSql());
            span.setTag("duration", query.getDuration());
            span.setTag("execution.time", query.getExecutionTime());

            if (query.getDuration() > 1000) {
                span.setTag("alert", true);
                sendAlert(query);
            }

            span.asyncFinish();
        }
    }

    private List<SlowQuery> getSlowQueries() {
        // 从数据库获取慢查询
        return queryRepository.findSlowQueries();
    }

    private void sendAlert(SlowQuery query) {
        // 发送告警
        Alert alert = new Alert();
        alert.setType("SLOW_QUERY");
        alert.setMessage("Slow query detected: " + query.getSql());
        alert.setSeverity("WARNING");

        alertService.send(alert);
    }
}
```

### 2. 性能指标收集

#### 2.1 自定义性能指标

```java
import org.apache.skywalking.apm.toolkit.trace.TraceContext;
import org.springframework.stereotype.Component;

@Component
public class PerformanceMetrics {

    private final MeterRegistry meterRegistry;

    public PerformanceMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    public void recordMethodExecution(String methodName, long duration, boolean success) {
        Tags tags = Tags.of(
            "method", methodName,
            "success", String.valueOf(success)
        );

        Timer timer = Timer.builder("method.execution")
            .description("Method execution time")
            .tags(tags)
            .register(meterRegistry);

        timer.record(duration, TimeUnit.MILLISECONDS);

        // 记录成功率
        Counter.builder("method.calls")
            .tags(tags)
            .register(meterRegistry)
            .increment();
    }

    public void recordDatabaseOperation(String operation, String table, long duration) {
        Tags tags = Tags.of(
            "operation", operation,
            "table", table
        );

        Timer timer = Timer.builder("database.operation")
            .description("Database operation time")
            .tags(tags)
            .register(meterRegistry);

        timer.record(duration, TimeUnit.MILLISECONDS);
    }
}
```

## 错误追踪

### 1. 错误监控配置

```java
import org.apache.skywalking.apm.toolkit.trace.Tags;
import org.apache.skywalking.apm.toolkit.trace.Trace;

@Service
public class ErrorTracker {

    @Trace
    public void trackError(Exception exception, String context) {
        Span span = ContextManager.createLocalSpan("error.track");

        try {
            span.setComponent("error");
            span.setTag("error.type", exception.getClass().getSimpleName());
            span.setTag("error.message", exception.getMessage());
            span.setTag("error.stack", Arrays.toString(exception.getStackTrace()));
            span.setTag("context", context);
            span.setTag("timestamp", System.currentTimeMillis());

            // 记录错误指标
            meterRegistry.counter("errors.total",
                "type", exception.getClass().getSimpleName())
                .increment();

            // 发送错误告警
            sendErrorAlert(exception, context);

        } finally {
            span.asyncFinish();
        }
    }

    private void sendErrorAlert(Exception exception, String context) {
        Alert alert = new Alert();
        alert.setType("ERROR");
        alert.setMessage("Error occurred: " + exception.getMessage());
        alert.setSeverity("ERROR");
        alert.setContext(context);
        alert.setTimestamp(System.currentTimeMillis());

        alertService.send(alert);
    }
}
```

### 2. 错误处理策略

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e,
            HttpServletRequest request) {

        // 记录错误到SkyWalking
        errorTracker.trackError(e, request.getRequestURI());

        // 创建错误响应
        ErrorResponse response = new ErrorResponse();
        response.setCode("ERROR");
        response.setMessage(e.getMessage());
        response.setTimestamp(System.currentTimeMillis());

        // 根据错误类型返回不同的HTTP状态码
        if (e instanceof BusinessException) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
        } else if (e instanceof NotFoundException) {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
        } else {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
        }
    }
}
```

## 数据可视化

### 1. 链路拓扑图

#### 1.1 获取链路数据

```java
import org.apache.skywalking.apm.network.language.agent.v3.SpanData;

@Service
public class TraceTopologyService {

    @Autowired
    private TraceQueryService traceQueryService;

    public List<ServiceNode> getTopology(String startTime, String endTime) {
        List<SpanData> spans = traceQueryService.queryTrace(startTime, endTime);

        // 构建拓扑图
        Map<String, ServiceNode> nodeMap = new HashMap<>();
        Map<String, ServiceRelation> relationMap = new HashMap<>();

        for (SpanData span : spans) {
            String serviceName = span.getServiceName();

            // 创建或获取服务节点
            ServiceNode node = nodeMap.computeIfAbsent(serviceName,
                k -> new ServiceNode(serviceName));

            // 更新节点指标
            node.addSpan(span);

            // 处理服务关系
            if (span.hasParentSpanId()) {
                String parentService = getParentService(span);
                String relationKey = parentService + "->" + serviceName;

                ServiceRelation relation = relationMap.computeIfAbsent(relationKey,
                    k -> new ServiceRelation(parentService, serviceName));

                relation.addCall(span);
            }
        }

        return buildTopology(nodeMap, relationMap);
    }

    private String getParentService(SpanData span) {
        // 获取父服务名称
        return traceQueryService.getParentService(span);
    }

    private List<ServiceNode> buildTopology(Map<String, ServiceNode> nodes,
            Map<String, ServiceRelation> relations) {
        List<ServiceNode> result = new ArrayList<>(nodes.values());

        // 为每个节点添加关系信息
        for (ServiceNode node : result) {
            node.setIncomingRelations(getIncomingRelations(node, relations));
            node.setOutgoingRelations(getOutgoingRelations(node, relations));
        }

        return result;
    }
}
```

#### 1.2 拓扑图数据结构

```java
public class ServiceNode {
    private String name;
    private List<SpanData> spans;
    private List<ServiceRelation> incomingRelations;
    private List<ServiceRelation> outgoingRelations;

    public void addSpan(SpanData span) {
        if (spans == null) {
            spans = new ArrayList<>();
        }
        spans.add(span);
    }

    public int getTotalCalls() {
        return spans != null ? spans.size() : 0;
    }

    public double getSuccessRate() {
        if (spans == null || spans.isEmpty()) {
            return 0;
        }

        long successCount = spans.stream()
            .filter(span -> span.getSpanType() == SpanType.SUCCESS)
            .count();

        return (double) successCount / spans.size();
    }

    public double getAverageDuration() {
        if (spans == null || spans.isEmpty()) {
            return 0;
        }

        double totalDuration = spans.stream()
            .mapToLong(SpanData::getDuration)
            .sum();

        return totalDuration / spans.size();
    }
}

public class ServiceRelation {
    private String sourceService;
    private String targetService;
    private List<SpanData> calls;

    public void addCall(SpanData span) {
        if (calls == null) {
            calls = new ArrayList<>();
        }
        calls.add(span);
    }

    public int getTotalCalls() {
        return calls != null ? calls.size() : 0;
    }

    public double getAverageDuration() {
        if (calls == null || calls.isEmpty()) {
            return 0;
        }

        double totalDuration = calls.stream()
            .mapToLong(SpanData::getDuration)
            .sum();

        return totalDuration / calls.size();
    }
}
```

### 2. 性能监控面板

#### 2.1 服务性能指标

```java
@Service
public class PerformanceDashboardService {

    public ServicePerformanceMetrics getServiceMetrics(String serviceName) {
        ServicePerformanceMetrics metrics = new ServicePerformanceMetrics();
        metrics.setServiceName(serviceName);

        // 获取响应时间分布
        Map<Double, Long> durationDistribution = getDurationDistribution(serviceName);
        metrics.setDurationDistribution(durationDistribution);

        // 获取成功率
        double successRate = getSuccessRate(serviceName);
        metrics.setSuccessRate(successRate);

        // 获取QPS
        double qps = getQPS(serviceName);
        metrics.setQps(qps);

        // 获取错误统计
        Map<String, Long> errorStats = getErrorStats(serviceName);
        metrics.setErrorStats(errorStats);

        return metrics;
    }

    private Map<Double, Long> getDurationDistribution(String serviceName) {
        // 从SkyWalking获取响应时间分布
        List<DurationBucket> buckets = traceQueryService.getDurationDistribution(
            serviceName, "1h");

        Map<Double, Long> distribution = new HashMap<>();
        for (DurationBucket bucket : buckets) {
            distribution.put(bucket.getUpperBound(), bucket.getCount());
        }

        return distribution;
    }

    private double getSuccessRate(String serviceName) {
        long totalCalls = traceQueryService.getTotalCalls(serviceName, "1h");
        long successCalls = traceQueryService.getSuccessCalls(serviceName, "1h");

        if (totalCalls == 0) {
            return 0;
        }

        return (double) successCalls / totalCalls;
    }
}
```

## 配置优化

### 1. 采样配置优化

```yaml
# 采样配置
skywalking:
  sampling:
    # 全局采样率
    percentage: 50

    # 自定义采样规则
    rules:
      # 核心服务100%采样
      - service: "order-service"
        percentage: 100
        priority: 1

      # 支付服务100%采样
      - service: "payment-service"
        percentage: 100
        priority: 2

      # 一般服务10%采样
      - service: "*"
        percentage: 10
        priority: 3

    # 慢查询自动采样
    slow-query:
      enabled: true
      threshold: 1000ms
      percentage: 100
```

### 2. 存储配置优化

```yaml
# 存储优化配置
storage:
  elasticsearch:
    # 索引优化
    indexShards: 10
    indexReplicas: 1

    # 批处理优化
    bulkActions: 5000
    bulkSize: 50
    flushInterval: 30

    # 查询优化
    metadataQueryMaxSize: 10000
    maxConcurrentQuery: 50

    # 数据保留策略
    # 7天热数据
    indexTTL: 7d
    # 30天温数据
    warmIndexTTL: 30d
    # 90天冷数据
    coldIndexTTL: 90d
```

## 故障排查

### 1. 常见问题

#### 1.1 数据丢失问题

```bash
# 检查OAP服务状态
curl http://localhost:12800/health

# 检查数据采集状态
curl http://localhost:12800/metrics

# 查看OAP日志
tail -f logs/skywalking-oap.log

# 检查Elasticsearch状态
curl -X GET "localhost:9200/_cat/indices?v"
```

#### 1.2 链路追踪不生效

```java
// 调试Span创建
public void debugSpan() {
    Span parentSpan = ContextManager.createEntrySpan("debug");
    parentSpan.setComponent("debug");

    try {
        // 检查Context是否正确设置
        if (ContextManager.isActive()) {
            Span childSpan = ContextManager.createLocalSpan("child.operation");
            childSpan.setComponent("child");
            childSpan.asyncFinish();
        } else {
            log.error("Context is not active");
        }

    } finally {
        parentSpan.asyncFinish();
    }
}
```

### 2. 性能调优

#### 2.1 JVM参数优化

```bash
# OAP服务JVM参数
export JAVA_OPTS="
-Xms2g
-Xmx4g
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:ParallelGCThreads=4
-XX:ConcGCThreads=2
-XX:InitiatingHeapOccupancyPercent=35
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/log/skywalking/heap-dump.hprof
"
```

#### 2.2 线程池配置

```yaml
# application.yml
thread-pool:
  core-pool-size: 10
  max-pool-size: 50
  queue-capacity: 1000
  keep-alive-seconds: 60
  thread-name-prefix: "skywalking-trace-"
```

## 版本历史

- v1.0.0 - 初始版本，基础SkyWalking集成
- v1.1.0 - 添加自定义指标收集
- v1.2.0 - 增强错误追踪功能
- v1.3.0 - 添加性能分析面板
- v1.4.0 - 优化采样配置
- v1.5.0 - 添加数据可视化功能

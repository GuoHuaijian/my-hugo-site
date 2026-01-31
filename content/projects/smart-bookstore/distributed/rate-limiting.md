---
title: "限流降级详解"
description: "智慧书店项目技术文档 - 限流降级详解"
date: 2024-01-01
weight: 11
difficulty: 3
readTime: 25
keywords: ['限流', 'Sentinel', '熔断', '降级']
---

# 限流降级详解

> Sentinel规则配置、降级策略、熔断机制

## 1. 限流降级概述

### 1.1 为什么需要限流降级
在高并发场景下，系统需要保护自己不被流量冲垮。限流降级的核心作用：
- **保护系统**：防止流量过载导致服务崩溃
- **保证核心功能**：降级非核心功能，保障主要业务
- **平滑降级**：优雅地拒绝请求，避免用户看到错误页面
- **资源隔离**：防止服务间调用雪崩

### 1.2 限流降级策略对比

| 策略 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| Sentinel | 细粒度控制、动态规则 | 功能强大、实时生效 | 学习成本高 |
| Hystrix | 隔离、降级、熔断 | 成熟稳定 | 功能相对简单 |
| Resilience4j | 现代、轻量 | API友好、易用 | 功能不如Sentinel丰富 |
| Guava RateLimiter | 简单限流 | 实现简单 | 功能单一 |

**本项目选择Sentinel**：功能完善，支持限流、熔断、降级，适合复杂业务场景。

## 2. Sentinel 配置

### 2.1 添加依赖
```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
    <version>2021.0.5.0</version>
</dependency>
```

### 2.2 配置文件
```yaml
# application.yml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080
        port: 8719
      eager: true
      datasource:
        ds1:
          nacos:
            server-addr: localhost:8848
            data-id: seckill-sentinel-flow
            group-id: SENTINEL_GROUP
            data-type: json
            rule-type: flow
      filter:
        enabled: true
      scg:
        # 网关限流配置
        rules:
          - resource: "/api/v1/seckill/**"
            count: 10000
            grade: 1
            limitApp: default
            strategy: 0
            controlBehavior: 0
            warmUpPeriodSec: 10

management:
  endpoints:
    web:
      exposure:
        include: '*'
```

### 2.3 自定义规则配置
```java
@Configuration
public class SentinelConfig {

    @Bean
    public SentinelGatewayConfig sentinelGatewayConfig() {
        SentinelGatewayConfig gatewayConfig = new SentinelGatewayConfig();
        gatewayConfig.setParser(new JsonParser());

        // 设置全局默认规则
        List<GatewayFlowRule> rules = new ArrayList<>();

        // 网关限流规则
        rules.add(new GatewayFlowRule("seckill_api")
                .setCount(10000)
                .setIntervalSec(1)
                .setGrade(RuleConstant.FLOW_GRADE_QPS)
                .setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_DEFAULT)
                .setBurst(0)
                .setMaxQueueingTimeMs(0));

        // 服务限流规则
        rules.add(new FlowRule("seckillService")
                .setCount(1000)
                .setGrade(RuleConstant.FLOW_GRADE_QPS)
                .setLimitApp("default"));

        gatewayConfig.setGatewayFlowRules(rules);

        return gatewayConfig;
    }
}
```

## 3. 限流规则配置

### 3.1 网关限流
```java
@Component
public class GatewayRateLimiter {

    @Bean
    public SentinelGatewayFilter gatewayFilter() {
        return new SentinelGatewayFilter();
    }

    @Bean
    public GatewayCallbackBlock gatewayCallbackBlock() {
        return new GatewayCallbackBlock() {
            @Override
            public Mono<Response> runRequest(ServerWebExchange exchange, BlockException ex) {
                // 限流后的自定义返回
                ServerHttpResponse response = exchange.getResponse();
                response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

                Result result = Result.fail("系统繁忙，请稍后重试");

                return Mono.just(new ServerResponse.Builder()
                        .statusCode(HttpStatus.TOO_MANY_REQUESTS)
                        .body(result)
                        .build());
            }
        };
    }
}
```

### 3.2 服务限流
```java
@Service
public class SeckillService {

    @SentinelResource(
        value = "doSeckill",
        blockHandler = "seckillBlockHandler",
        fallback = "seckillFallback",
        fallbackClass = SeckillFallbackHandler.class
    )
    public Result<SeckillResponse> doSeckill(SeckillRequest request) {
        // 业务逻辑
        return doBusinessLogic(request);
    }

    /**
     * 限流处理器
     */
    public Result<SeckillResponse> seckillBlockHandler(SeckillRequest request, BlockException ex) {
        log.warn("请求被限流: {}", request);

        // 热点参数限流特殊处理
        if (ex instanceof HotParamFlowException) {
            HotParamFlowException hotEx = (HotParamFlowException) ex;
            return Result.fail("该商品抢购过于火爆，请稍后重试");
        }

        // 普通限流
        return Result.fail("系统繁忙，请稍后重试");
    }
}
```

### 3.3 热点参数限流
```java
@Configuration
public class HotSpotConfig {

    @Bean
    public SentinelResourceAspect sentinelResourceAspect() {
        return new SentinelResourceAspect();
    }

    @Bean
    public DegradeRuleManager degradeRuleManager() {
        DegradeRuleManager ruleManager = new DegradeRuleManager();
        // 添加降级规则
        ruleManager.loadRules(Arrays.asList(
            new DegradeRule("seckillService")
                .setGrade(RuleConstant.DEGRADE_GRADE_RT)
                .setCount(100)  // RT阈值100ms
                .setTimeWindow(10)  // 时间窗口10秒
                .setMinRequestAmount(5)  // 最小请求数5
                .setRtSlowRequestAmount(10)  // 慢请求数10
        ));
        return ruleManager;
    }
}
```

## 4. 熔断机制

### 4.1 熔断规则配置
```java
@Component
public class CircuitBreakerConfig {

    @Bean
    public CircuitBreakerRule circuitBreakerRule() {
        // 熔断规则：错误率超过50%触发熔断
        return new CircuitBreakerRule("seckillService")
                .setGrade(RuleConstant.DEGRADE_GRADE_ERROR_RATIO)
                .setCount(0.5)  // 50%错误率
                .setTimeWindow(10)  // 熔断时间窗口10秒
                .setMinRequestAmount(10)  // 最小请求数10
                .setSlowRatioThreshold(0.5);  // 慢请求比例50%
    }
}
```

### 4.2 熔断策略
```java
@Service
public class SeckillService {

    @SentinelResource(
        value = "createOrder",
        blockHandler = "blockHandler",
        fallback = "fallback",
        fallbackClass = FallbackHandler.class,
        defaultFallback = "defaultFallback"
    )
    public Result<Order> createOrder(CreateOrderRequest request) {
        // 创建订单逻辑
        return orderService.createOrder(request);
    }
}
```

### 4.3 熔断状态处理
```java
@Component
public class CircuitBreakerHandler {

    /**
     * 熔断打开时的处理
     */
    public Result<Object> handleCircuitBreaker() {
        // 返回降级数据
        return Result.fail("系统维护中，请稍后重试");
    }

    /**
     * 半开状态处理
     */
    public Result<Object> handleHalfOpen() {
        // 尝试恢复服务
        try {
            // 测试调用
            testService.healthCheck();
            return Result.success("服务已恢复");
        } catch (Exception e) {
            return Result.fail("服务仍未恢复");
        }
    }
}
```

## 5. 降级策略

### 5.1 服务降级
```java
/**
 * 降级处理器
 */
@Component
public class SeckillFallbackHandler {

    /**
     * 服务降级
     */
    public Result<SeckillResponse> seckillFallback(SeckillRequest request, Throwable t) {
        log.error("服务降级: {}", t.getMessage());

        // 返回默认值或缓存数据
        SeckillResponse response = new SeckillResponse();
        response.setCode("DEGRADE");
        response.setMessage("系统繁忙，请稍后重试");
        response.setData(null);

        return Result.success(response);
    }

    /**
     * 默认降级
     */
    public Result<SeckillResponse> defaultFallback() {
        return Result.fail("系统维护中，请稍后重试");
    }
}
```

### 5.2 数据降级
```java
@Service
public class ProductService {

    @Autowired
    private ProductCache productCache;

    @Autowired
    private ProductFallbackService fallbackService;

    @SentinelResource(
        value = "getProductDetail",
        fallback = "getProductFallback",
        fallbackClass = ProductFallbackHandler.class
    )
    public ProductDTO getProductDetail(Long productId) {
        return productMapper.selectById(productId);
    }

    /**
     * 数据降级：返回缓存数据或默认数据
     */
    public ProductDTO getProductFallback(Long productId) {
        // 1. 尝试从缓存获取
        ProductDTO cached = productCache.get(productId);
        if (cached != null) {
            return cached;
        }

        // 2. 返回默认数据
        return fallbackService.getDefaultProduct();
    }
}
```

### 5.3 业务降级
```java
@Service
public class OrderService {

    @Autowired
    private OrderFallbackService fallbackService;

    @SentinelResource(
        value = "createOrder",
        fallback = "createOrderFallback"
    )
    public Order createOrder(Order order) {
        // 正常创建订单
        return orderMapper.insert(order);
    }

    /**
     * 业务降级：简化版订单处理
     */
    public Order createOrderFallback(Order order) {
        // 1. 创建简化订单（不涉及复杂逻辑）
        SimpleOrder simpleOrder = fallbackService.createSimpleOrder(order);

        // 2. 异步通知用户
        notifyService.asyncNotify(simpleOrder);

        return simpleOrder;
    }
}
```

## 6. 隔离策略

### 6.1 线程池隔离
```java
@Configuration
public class ThreadPoolConfig {

    @Bean
    public ThreadPoolExecutor seckillThreadPool() {
        return new ThreadPoolExecutor(
            10, // 核心线程数
            50, // 最大线程数
            60, // 空闲时间
            TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(1000), // 队列
            new ThreadFactory() {
                private AtomicInteger count = new AtomicInteger(0);

                @Override
                public Thread newThread(Runnable r) {
                    Thread t = new Thread(r);
                    t.setName("seckill-thread-" + count.getAndIncrement());
                    return t;
                }
            },
            new ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略
        );
    }
}
```

### 6.2 信号量隔离
```java
@Service
public class RemoteService {

    @Autowired
    private ThreadPoolExecutor threadPool;

    @SentinelResource(
        value = "remoteCall",
        blockHandler = "remoteBlockHandler"
    )
    public Result<String> remoteCall(String param) {
        // 使用线程池隔离
        CompletableFuture<Result<String>> future = CompletableFuture.supplyAsync(() -> {
            // 远程调用
            return remoteClient.call(param);
        }, threadPool);

        try {
            return future.get(5, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            throw new TimeoutException("调用超时");
        }
    }

    public Result<String> remoteBlockHandler(String param, BlockException ex) {
        // 降级处理
        return Result.fail("服务繁忙，请稍后重试");
    }
}
```

## 7. 监控和告警

### 7.1 监控配置
```java
@Configuration
public class SentinelMonitorConfig {

    @Bean
    public MetricRegistry metricRegistry() {
        return new MetricRegistry();
    }

    @Bean
    public CustomDashboardUrlCustomizer customDashboardUrlCustomizer() {
        return new CustomDashboardUrlCustomizer() {
            @Override
            public String getCustomDashboardServerUrl() {
                return "http://localhost:8080";
            }
        };
    }

    @Scheduled(fixedRate = 10000)
    public void reportMetrics() {
        // 上报监控指标到监控系统
        metricRegistry().reportTo(prometheus);
    }
}
```

### 7.2 告警配置
```java
@Component
public class SentinelAlertManager implements SentinelPropertyListener {

    @Autowired
    private AlertService alertService;

    @Override
    public void configUpdate(PropertyType propertyType) {
        // 配置更新告警
        alertService.sendAlert("Sentinel配置已更新");
    }

    /**
     * 限流告警
     */
    @EventListener
    public void handleFlowBlockEvent(FlowBlockEvent event) {
        Alert alert = new Alert();
        alert.setType("FLOW_BLOCK");
        alert.setTitle("请求被限流");
        alert.setContent("资源: " + event.getResource() + ", 时间: " + event.getTimestamp());
        alertService.send(alert);
    }

    /**
     * 熔断告警
     */
    @EventListener
    public void handleDegradeEvent(DegradeEvent event) {
        Alert alert = new Alert();
        alert.setType("DEGRADE");
        alert.setTitle("服务熔断");
        alert.setContent("资源: " + event.getResource() + ", 熔断原因: " + event.getRule());
        alertService.send(alert);
    }
}
```

## 8. 动态规则管理

### 8.1 Nacos规则管理
```java
@Configuration
public class SentinelNacosConfig {

    @Bean
    public RuleNacosPublisher flowRulePublisher() {
        return new RuleNacosPublisher(
            "SEATA_GROUP",
            "seckill-flow-rules",
            nacosProperties
        );
    }

    @Bean
    public RuleNacosConfig flowRuleConfig() {
        return new RuleNacosConfig(
            "SEATA_GROUP",
            "seckill-flow-rules",
            nacosProperties
        );
    }
}
```

### 8.2 动态规则API
```@RestController
@RequestMapping("/sentinel/rules")
public class SentinelRuleController {

    @Autowired
    private FlowRuleManager flowRuleManager;

    /**
     * 更新限流规则
     */
    @PostMapping("/flow")
    public Result<Void> updateFlowRules(@RequestBody List<FlowRule> rules) {
        flowRuleManager.loadRules(rules);
        return Result.success();
    }

    /**
     * 获取当前规则
     */
    @GetMapping("/flow")
    public Result<List<FlowRule>> getFlowRules() {
        return Result.success(flowRuleManager.getRules());
    }
}
```

## 9. 限流算法实现

### 9.1 令牌桶算法
```java
@Component
public class TokenBucketRateLimiter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public boolean tryAcquire(String resource, int capacity, int refillRate) {
        Bucket bucket = buckets.computeIfAbsent(resource,
            k -> Bucket.builder()
                .withCapacity(capacity)
                .withRefill(refillRate)
                .build()
        );

        return bucket.tryConsume(1);
    }

    @Data
    @AllArgsConstructor
    public static class Bucket {
        private int capacity;
        private int tokens;
        private int refillRate;
        private long lastRefillTime;

        public boolean tryConsume(int tokens) {
            synchronized (this) {
                refill();
                if (this.tokens >= tokens) {
                    this.tokens -= tokens;
                    return true;
                }
                return false;
            }
        }

        private void refill() {
            long now = System.currentTimeMillis();
            int elapsedSeconds = (int) ((now - lastRefillTime) / 1000);
            tokens = Math.min(capacity, tokens + elapsedSeconds * refillRate);
            lastRefillTime = now;
        }
    }
}
```

### 9.2 漏桶算法
```java
@Component
public class LeakyBucketRateLimiter {

    private final Map<String, LeakyBucket> buckets = new ConcurrentHashMap<>();

    public boolean tryAcquire(String resource, int capacity, int leakRate) {
        LeakyBucket bucket = buckets.computeIfAbsent(resource,
            k -> new LeakyBucket(capacity, leakRate)
        );

        return bucket.tryConsume(1);
    }

    @Data
    public static class LeakyBucket {
        private final int capacity;
        private final int leakRate;
        private int currentWater;
        private long lastLeakTime;

        public synchronized boolean tryConsume(int amount) {
            leak();
            if (currentWater + amount <= capacity) {
                currentWater += amount;
                return true;
            }
            return false;
        }

        private void leak() {
            long now = System.currentTimeMillis();
            int elapsedSeconds = (int) ((now - lastLeakTime) / 1000);
            currentWater = Math.max(0, currentWater - elapsedSeconds * leakRate);
            lastLeakTime = now;
        }
    }
}
```

## 10. 性能优化

### 10.1 缓存优化
```java
@Service
public class SeckillService {

    @Autowired
    private RateLimiterCache rateLimiterCache;

    public Result<SeckillResponse> doSeckill(SeckillRequest request) {
        // 1. 先从缓存检查限流
        String cacheKey = buildCacheKey(request);
        if (!rateLimiterCache.tryAcquire(cacheKey)) {
            return Result.fail("请求过于频繁");
        }

        // 2. 业务处理
        return doBusiness(request);
    }

    @Component
    public static class RateLimiterCache {
        private final LoadingCache<String, TokenBucket> cache;

        public RateLimiterCache() {
            this.cache = Caffeine.newBuilder()
                .maximumSize(10000)
                .expireAfterWrite(1, TimeUnit.MINUTES)
                .build(key -> new TokenBucket(100, 10));
        }

        public boolean tryAcquire(String key) {
            return cache.get(key).tryConsume(1);
        }
    }
}
```

### 10.2 批量限流
```java
@Component
public class BatchRateLimiter {

    private final RateLimiter rateLimiter = RateLimiter.create(1000); // 1000 QPS

    public Result<List<SeckillResponse>> batchSeckill(List<SeckillRequest> requests) {
        // 批量检查限流
        if (!rateLimiter.tryAcquire(requests.size())) {
            return Result.fail("系统繁忙");
        }

        // 批量处理
        List<SeckillResponse> responses = requests.parallelStream()
            .map(this::doSeckill)
            .collect(Collectors.toList());

        return Result.success(responses);
    }
}
```

## 11. 最佳实践

### 11.1 限流策略选择
```
1. 优先使用QPS限流：简单直接，适合大多数场景
2. 热点参数限流：保护重点资源
3. 链路限流：防止流量被特定调用链路冲垮
4. 阈值类型：QPS > 线程数 > 并发数
```

### 11.2 降级策略设计
1. **核心保护**：优先保障核心业务
2. **优雅降级**：返回友好提示，不暴露错误
3. **数据降级**：返回缓存数据或默认值
4. **业务简化**：提供简化版功能

### 11.3 监控告警
1. **实时监控**：设置合理的告警阈值
2. **历史分析**：定期分析限流数据
3. **容量规划**：根据限流数据扩容
4. **持续优化**：不断调整限流策略

---

[返回文档首页](../README.md) | [上一篇：消息队列详解](./message-queue.md) | [下一篇：可观测性详解](./observability.md)

---
title: "分布式锁详解"
description: "智慧书店项目技术文档 - 分布式锁详解"
date: 2024-01-01
weight: 7
difficulty: 3
readTime: 40
keywords: ['分布式锁', 'Redisson', '并发控制', 'Redis']
---

# 分布式锁详解

> Redisson实现、应用场景、最佳实践

## 1. 分布式锁概述

### 1.1 为什么需要分布式锁
在分布式系统中，多个 JVM 实例同时访问共享资源时，需要一种跨 JVM 的互斥机制来保证数据一致性。分布式锁就是解决这个问题的技术方案。

### 1.2 分布式锁要求
- **互斥性**：任意时刻只有一个客户端能持有锁
- **安全性**：锁只能被持有者释放
- **可重入性**：同一线程可以多次获取同一把锁
- **高性能**：获取和释放锁的开销要小
- **容错性**：Redis 宕机后不影响系统可用性

## 2. Redisson 实现

### 2.1 Redisson 简介
Redisson 是一个 Redis 客户端，提供了丰富的分布式功能，包括分布式锁、分布式集合、分布式对象等。

### 2.2 添加依赖
```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>3.23.0</version>
</dependency>
```

### 2.3 配置 Redisson
```yaml
# application.yml
spring:
  redis:
    host: localhost
    port: 6379
    password:
    database: 0
    timeout: 3000
    lettuce:
      pool:
        max-active: 8
        max-wait: -1
        max-idle: 8
        min-idle: 0

# Redisson配置
redisson:
  address: "redis://localhost:6379"
  password:
  database: 0
  threads: 16
  nettyThreads: 32
  transportMode: "NIO"
```

### 2.4 基本使用
```java
@Autowired
private RedissonClient redissonClient;

public void doSomethingWithLock() {
    // 获取锁
    RLock lock = redissonClient.getLock("myLock");

    try {
        // 尝试获取锁，最多等待10秒，锁自动释放时间30秒
        boolean locked = lock.tryLock(10, 30, TimeUnit.SECONDS);
        if (locked) {
            // 执行业务逻辑
            doBusiness();
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    } finally {
        // 释放锁
        if (lock.isHeldByCurrentThread()) {
            lock.unlock();
        }
    }
}
```

## 3. 秒杀场景下的分布式锁

### 3.1 锁的设计
```java
/**
 * 秒杀分布式锁
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface DistributedLock {
    String key(); // 锁的key表达式
    long waitTime() default 0; // 等待时间，毫秒
    long leaseTime() default 10; // 锁自动释放时间，秒
}

@Aspect
@Component
public class DistributedLockAspect {

    @Autowired
    private RedissonClient redissonClient;

    @Around("@annotation(distributedLock)")
    public Object around(ProceedingJoinPoint joinPoint, DistributedLock distributedLock) throws Throwable {
        // 解析锁key
        String key = parseKey(joinPoint, distributedLock.key());
        RLock lock = redissonClient.getLock(key);

        try {
            // 获取锁
            boolean locked = lock.tryLock(
                distributedLock.waitTime(),
                distributedLock.leaseTime(),
                TimeUnit.SECONDS
            );

            if (!locked) {
                throw new BusinessException("系统繁忙，请稍后重试");
            }

            // 执行目标方法
            return joinPoint.proceed();
        } finally {
            // 释放锁
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    private String parseKey(ProceedingJoinPoint joinPoint, String keyExpression) {
        // 使用SpEL解析表达式
        ExpressionParser parser = new SpelExpressionParser();
        Expression expression = parser.parseExpression(keyExpression);

        // 获取方法参数
        StandardEvaluationContext context = new StandardEvaluationContext();
        Object[] args = joinPoint.getArgs();
        String[] paramNames = ((MethodSignature) joinPoint.getSignature()).getParameterNames();

        for (int i = 0; i < args.length; i++) {
            context.setVariable(paramNames[i], args[i]);
        }

        return expression.getValue(context, String.class);
    }
}
```

### 3.2 使用示例
```java
@Service
public class SeckillService {

    @DistributedLock(key = "'seckill:' + #userId + ':' + #productId",
                    waitTime = 0,
                    leaseTime = 10)
    public Result<SeckillResponse> doSeckill(Long userId, Long productId) {
        // 业务逻辑
        // ...
        return Result.success(response);
    }
}
```

### 3.3 锁的粒度设计
```
高粒度锁：整个秒杀活动一个锁
Key: seckill:activity:1001
问题：并发度低，成为性能瓶颈

中粒度锁：每个商品一个锁
Key: seckill:product:2001
推荐：折中方案，并发度适中

低粒度锁：每个用户+商品一个锁
Key: seckill:user:1001:product:2001
问题：锁的数量多，管理复杂
```

## 4. Redisson 高级特性

### 4.1 可重入锁
```java
// 同一线程可多次获取
RLock lock = redissonClient.getLock("reentrantLock");
lock.lock(); // 第一次获取
lock.lock(); // 第二次获取
lock.unlock(); // 释放一次
lock.unlock(); // 释放两次，真正释放
```

### 4.2 公平锁
```java
// 公平锁，按请求顺序获取
RLock fairLock = redissonClient.getFairLock("fairLock");
fairLock.lock();
```

### 4.3 读写锁
```java
// 读写锁
RReadWriteLock rwLock = redissonClient.getReadWriteLock("rwLock");

// 读锁（可多个线程同时持有）
rwLock.readLock().lock();

// 写锁（互斥）
rwLock.writeLock().lock();
```

### 4.4 闭锁
```java
// 闭锁，计数器归零后唤醒所有等待线程
RCountDownLatch latch = redissonClient.getCountDownLatch("latch");
latch.trySetCount(3); // 设置计数器
latch.countDown(); // 计数器减1
latch.await(); // 等待计数器归零
```

## 5. 锁的续期机制

### 5.1 Watch Dog 机制
Redisson 内置了 Watch Dog 机制，当锁的租约时间即将过期时，会自动续期。

```java
// 看门狗默认30秒续期
RLock lock = redissonClient.getLock("myLock");
lock.lock(); // 默认看门狗开启

// 或指定时间，看门狗不开启
lock.lock(10, TimeUnit.SECONDS);
```

### 5.2 自定义续期
```java
// 开启看门狗
RLock lock = redissonClient.getLock("myLock");
lock.lock();

// 监听锁事件
lock.onComplete((type, throwable) -> {
    if (type == RFuture.CompleteType.SUCCESS) {
        // 锁获取成功
    } else if (type == RFuture.CompleteType.FAILURE) {
        // 锁获取失败
    }
});
```

## 6. 锁的释放策略

### 6.1 自动释放
```java
// 锁自动释放
lock.lock(10, TimeUnit.SECONDS); // 10秒后自动释放
```

### 6.2 手动释放
```java
// 手动释放锁
if (lock.isHeldByCurrentThread()) {
    lock.unlock();
}
```

### 6.3 异常处理
```java
try {
    boolean locked = lock.tryLock(5, 10, TimeUnit.SECONDS);
    if (locked) {
        try {
            // 业务逻辑
        } finally {
            lock.unlock();
        }
    }
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
    // 处理中断
}
```

## 7. 监控和诊断

### 7.1 锁的监控
```java
// 获取锁的信息
RLock lock = redissonClient.getLock("myLock");
System.out.println("锁的名称: " + lock.getName());
System.out.println("锁的剩余时间: " + lock.remainTimeToLive());
System.out.println("是否被当前线程持有: " + lock.isHeldByCurrentThread());
```

### 7.2 Redis 监控
```bash
# 查看锁信息
redis-cli -h localhost -p 6379 info keyspace

# 查看具体锁
redis-cli --scan --pattern "seckill:*" | head -10
```

## 8. 最佳实践

### 8.1 锁的key设计原则
- 使用明确的命名规范
- 包含业务上下文信息
- 避免过长的key
- 使用冒号分隔层级

```java
// 好的key设计
Key: seckill:user:1001:product:2001
Key: order:lock:2024-01-01:order-no:ABCD1234

// 不好的key设计
Key: lock
Key: seckill123
Key: very:long:key:with:lots:of:information:that:makes:it:hard:to:read
```

### 8.2 锁的持有时间
- 锁的持有时间应该尽可能短
- 避免在锁内进行网络调用、数据库查询等耗时操作
- 将耗时操作移到锁外执行

```java
// 错误示例
public void doWrong() {
    lock.lock();
    try {
        // 锁内执行耗时操作
        Thread.sleep(1000); // 避免这样做
        externalService.call(); // 避免这样做
        database.query(); // 避免这样做
    } finally {
        lock.unlock();
    }
}

// 正确示例
public void doRight() {
    // 先准备数据
    Data data = prepareData();

    // 再加锁执行核心逻辑
    lock.lock();
    try {
        coreBusiness(data);
    } finally {
        lock.unlock();
    }
}
```

### 8.3 死锁预防
- 设置合理的锁超时时间
- 避免锁的循环等待
- 使用tryLock替代lock
- 实现锁的可重入性

### 8.4 性能优化
- 使用本地缓存减少锁的获取
- 批量处理减少锁的粒度
- 使用读写锁替代互斥锁
- 实现锁的降级策略

## 9. 故障排查

### 9.1 常见问题
1. **锁获取超时**：检查锁的key是否存在，查看Redis性能
2. **锁未释放**：检查是否正确调用unlock方法
3. **锁竞争激烈**：考虑优化锁的粒度或使用读写锁

### 9.2 解决方案
```java
// 锁获取失败降级
public Result<SeckillResponse> doSeckill(Long userId, Long productId) {
    RLock lock = redissonClient.getLock(buildLockKey(userId, productId));

    try {
        // 快速失败
        boolean locked = lock.tryLock(0, 10, TimeUnit.SECONDS);
        if (!locked) {
            return Result.fail("抢购过于火爆，请稍后重试");
        }

        // 执行业务
        return doBusiness();
    } finally {
        unlock(lock);
    }
}

// 异步获取锁
public CompletableFuture<Result<SeckillResponse>> doSeckillAsync(Long userId, Long productId) {
    RLock lock = redissonClient.getLock(buildLockKey(userId, productId));

    return CompletableFuture.supplyAsync(() -> {
        try {
            if (lock.tryLock(5, 10, TimeUnit.SECONDS)) {
                return doBusiness();
            }
            return Result.fail("系统繁忙");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return Result.fail("操作被中断");
        } finally {
            unlock(lock);
        }
    });
}
```

---

[返回文档首页](../README.md) | [下一篇：分布式事务详解](./distributed-transaction.md)

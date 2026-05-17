---
title: Java 并发编程指南
---

## 核心概念

### 线程创建方式

```java
// 1. 继承 Thread
new Thread(() -> System.out.println("Hello")).start();

// 2. 实现 Runnable
ExecutorService executor = Executors.newFixedThreadPool(10);
executor.submit(() -> System.out.println("Task"));

// 3. 实现 Callable（有返回值）
Future<String> future = executor.submit(() -> "Result");
String result = future.get();

// 4. 虚拟线程（JDK 21+）
Thread.startVirtualThread(() -> System.out.println("Virtual"));
```

## JUC 核心组件

### 线程池

```java
// 推荐：手动创建线程池
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    10,                     // 核心线程数
    20,                     // 最大线程数
    60L, TimeUnit.SECONDS,  // 空闲超时
    new LinkedBlockingQueue<>(100),  // 队列
    Executors.defaultThreadFactory(),
    new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
);
```

### 并发工具类

```java
// CountDownLatch — 等待多个操作完成
CountDownLatch latch = new CountDownLatch(3);
latch.countDown();
latch.await();

// CyclicBarrier — 线程同步屏障
CyclicBarrier barrier = new CyclicBarrier(3);
barrier.await();

// Semaphore — 信号量（限流）
Semaphore semaphore = new Semaphore(5);
semaphore.acquire();
semaphore.release();
```

### 并发集合

```java
// 线程安全 Map
ConcurrentHashMap<String, Object> map = new ConcurrentHashMap<>();

// 线程安全 List
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();

// 阻塞队列
ArrayBlockingQueue<String> queue = new ArrayBlockingQueue<>(100);
LinkedBlockingQueue<String> linkedQueue = new LinkedBlockingQueue<>();
```

## 锁机制

```java
// ReentrantLock
ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    // 临界区
} finally {
    lock.unlock();
}

// ReadWriteLock
ReadWriteLock rwLock = new ReentrantReadWriteLock();
rwLock.readLock().lock();   // 读锁（共享）
rwLock.writeLock().lock();  // 写锁（独占）

// StampedLock（JDK 8+）
StampedLock stampedLock = new StampedLock();
long stamp = stampedLock.readLock();
stampedLock.unlockRead(stamp);
```

## CompletableFuture

```java
// 异步执行
CompletableFuture.supplyAsync(() -> fetchData())
    .thenApply(data -> transform(data))
    .thenAccept(result -> System.out.println(result))
    .exceptionally(ex -> { log.error(ex); return null; });

// 组合多个 Future
CompletableFuture.allOf(future1, future2, future3).join();
CompletableFuture.anyOf(future1, future2).join();
```

## 虚拟线程（JDK 21+）

```java
// 创建虚拟线程
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return i;
        });
    });
}

// 适用于 I/O 密集型任务，不适合 CPU 密集型
```

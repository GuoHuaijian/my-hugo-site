---
title: "深入理解ConcurrentHashMap源码——从设计到实现"
date: 2025-11-21
author: "Guo"
tags: ["学习笔记", "并发"]
comments: true
toc: true
---

> 本文基于 JDK 1.8 源码，系统分析 ConcurrentHashMap 的核心设计与关键源码实现。

ConcurrentHashMap 是 Java 并发编程中最常被问到的类之一。
面试里常见问题包括：

- 为什么 ConcurrentHashMap 是线程安全的？
- JDK 1.7 和 1.8 的实现有什么区别？
- sizeCtl、ForwardingNode、TreeBin 都是干什么的？
- put / get / 扩容 的完整流程？

## 一、为什么要有 ConcurrentHashMap？

先把位置摆清楚：

- `HashMap`：线程不安全，多线程 put/resize 会出现数据丢失，JDK 7 甚至可能出现链表成环导致死循环。
- `Hashtable`：线程安全，但粗暴地在所有方法上 `synchronized`，等于一把“全局大锁”，并发性能很差。
- `ConcurrentHashMap`：在保证线程安全的前提下，尽可能提高并发性能，是并发场景下最常用的 Map 实现。

### 1.1 HashMap 在并发下的问题

JDK 7 中，HashMap 在并发扩容时，由于链表采用头插法，可能会形成环形链表，导致 get 时死循环。

JDK 8 改为了尾插法，避免成环，但并发 put 仍然会出现“后写覆盖前写、数据丢失”的情况，本质上仍然是线程不安全。

而 Hashtable 虽然“安全”，但：

```java
public synchronized V put(K key, V value) { ... }
public synchronized V get(Object key) { ... }
// 所有方法都加 synchronized
```

- 所有操作互斥，包括读
- 多线程下并发度几乎为 1

ConcurrentHashMap 的设计目标正是：
**在多线程读多写多的场景下，提供高吞吐、低锁竞争的 Map 实现。**

------

## 二、JDK 1.7 的 ConcurrentHashMap：Segment 分段锁

JDK 7 中的 ConcurrentHashMap 大体结构：

```tex
ConcurrentHashMap
   └── Segment[] segments       // 每个 Segment 相当于一个小的 Hashtable
           └── HashEntry[] table
                   └── HashEntry 链表
```

- 每个 `Segment` 继承自 `ReentrantLock`，内部维护一个 HashEntry 数组。
- 每次 put/ remove 只锁住某个 Segment，实现“分段锁”，默认 16 段，并发度理论上是 16。

局限：

1. Segment 个数初始化后固定，不能动态增长，并发度上限受限。
2. 结构复杂：Segment + HashEntry，多层嵌套。
3. 内存上：16 个 Segment 即使用不到也要创建。

这直接引出了 JDK 1.8 的重构。

------

## 三、JDK 1.8 的 ConcurrentHashMap：整体设计

JDK 1.8 中，ConcurrentHashMap 做了彻底重构：

- **去掉 Segment**，结构简化为：数组 + 链表/红黑树。
- **锁粒度变细**：不再锁 Segment，而是锁具体的桶（某一个数组元素）。
- **引入 CAS + synchronized** 的组合来控制并发。
- **支持链表转红黑树**，提升高碰撞场景下的查询效率。

整体结构：

```tex
Node<K, V>[] table

table[i]
  ├── Node (链表头)
  ├── TreeBin（红黑树包装）
  └── ForwardingNode（扩容时的占位节点）
```

------

## 四、核心数据结构与关键字段

### 4.1 Node 节点

底层存放 key-value 的基本单元：

```java
static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;
    final K key;
    volatile V val;
    volatile Node<K,V> next;

    Node(int hash, K key, V val, Node<K,V> next) {
        this.hash = hash;
        this.key = key;
        this.val = val;
        this.next = next;
    }

    // 省略 getKey / getValue / equals / hashCode

    // 用于 get() 时链表查找
    Node<K,V> find(int h, Object k) {
        Node<K,V> e = this;
        if (k != null) {
            do {
                K ek;
                if (e.hash == h &&
                    ((ek = e.key) == k || (ek != null && k.equals(ek))))
                    return e;
            } while ((e = e.next) != null);
        }
        return null;
    }
}
```

几点注意：

- `val` 和 `next` 是 `volatile`，保证多线程下的可见性。
- `key` 和 `hash` 是 `final`，构造后不再变化，保证不可变性。

### 4.2 ForwardingNode：扩容占位节点

扩容时，老数组中已完成迁移的桶会被替换成一个特殊节点 `ForwardingNode`：

```java
static final class ForwardingNode<K,V> extends Node<K,V> {
    final Node<K,V>[] nextTable; // 指向新数组

    ForwardingNode(Node<K,V>[] tab) {
        super(MOVED, null, null, null); // hash = -1
        this.nextTable = tab;
    }

    Node<K,V> find(int h, Object k) {
        outer: for (Node<K,V>[] tab = nextTable;;) {
            Node<K,V> e; int n;
            if (k == null || tab == null || (n = tab.length) == 0 ||
                (e = tabAt(tab, (n - 1) & h)) == null)
                return null;
            for (;;) {
                int eh; K ek;
                if ((eh = e.hash) == h &&
                    ((ek = e.key) == k || (ek != null && k.equals(ek))))
                    return e;
                if (eh < 0) {
                    if (e instanceof ForwardingNode) {
                        tab = ((ForwardingNode<K,V>)e).nextTable;
                        continue outer; // 继续沿着新表找
                    } else {
                        return e.find(h, k);
                    }
                }
                if ((e = e.next) == null)
                    return null;
            }
        }
    }
}
```

作用：

- 标记这个桶的数据已经被迁移到新数组。
- `get` 遇到它会去新数组查找。
- `put` 遇到它会调用 `helpTransfer` 来“帮忙扩容”。

### 4.3 TreeNode / TreeBin：红黑树节点

当单个桶中的链表长度超过阈值（8）且 table 容量足够大时，会转为红黑树：

- `TreeNode`：红黑树节点。
- `TreeBin`：作为桶中的头节点，内部维护一棵红黑树以及对应的双向链表。

简化后的结构大致如下（源码较长，这里只示意）：

```java
static final class TreeNode<K,V> extends Node<K,V> {
    TreeNode<K,V> parent;  // 父节点
    TreeNode<K,V> left;
    TreeNode<K,V> right;
    TreeNode<K,V> prev;    // 维护双向链表
    boolean red;

    TreeNode(int hash, K key, V val, Node<K,V> next,
             TreeNode<K,V> parent) {
        super(hash, key, val, next);
        this.parent = parent;
    }

    // find 等一系列红黑树操作
}

static final class TreeBin<K,V> extends Node<K,V> {
    TreeNode<K,V> root;     // 红黑树根节点
    volatile TreeNode<K,V> first; // 链表头
    // lockState 等用于控制并发访问的字段

    // putTreeVal、removeTreeNode、find 等复杂逻辑
}
```

### 4.4 sizeCtl：最关键的控制字段

`sizeCtl` 是 ConcurrentHashMap 的“中枢神经”，含义比较多：

```java
/**
 * sizeCtl 含义：
 *   = -1              : 正在初始化（initTable 中）
 *   = -(1 + nThreads) : 正在扩容，有 nThreads 个线程参与
 *   = 0               : 还未初始化，使用默认容量
 *   > 0               : ① 未初始化时：表示初始化使用的容量
 *                       ② 初始化后：表示下一次扩容的阈值 (capacity * loadFactor)
 */
private transient volatile int sizeCtl;
```

另外还有：

```java
transient volatile Node<K,V>[] table;
private transient volatile Node<K,V>[] nextTable;
private transient volatile long baseCount;
private transient volatile CounterCell[] counterCells;
private transient volatile int cellsBusy;      // CounterCell 数组锁
private transient volatile int transferIndex;  // 扩容任务分配索引
```

------

## 五、hash 计算与数组下标定位

### 5.1 扰动函数 spread

```java
// 对 key.hashCode() 做一次扰动，避免低位利用不足导致碰撞
static final int spread(int h) {
    return (h ^ (h >>> 16)) & HASH_BITS;
}
```

- 把高 16 位参与到低位运算中，降低 hash 碰撞概率。
- `HASH_BITS = 0x7fffffff`，对最高位清零，保证非负。

### 5.2 桶下标计算

```java
int hash = spread(key.hashCode());
int index = (table.length - 1) & hash;  // 前提：length 是 2 的幂
```

- 利用 `n-1` 与运算代替取模 `%`，性能更高。
- 这也是为什么 ConcurrentHashMap 的容量总是 2 的幂次方。

------

## 六、put 流程源码解析（核心）

对 `put` 的理解，基本等于吃透 ConcurrentHashMap 的一半。

### 6.1 put 到 putVal

```java
public V put(K key, V value) {
    return putVal(key, value, false);
}
```

`onlyIfAbsent = false`，表示如果 key 已经存在，会覆盖旧值。

### 6.2 putVal 主流程

下面是精简过的源码，去掉了与主线无关的逻辑，重点在于流程：

```java
final V putVal(K key, V value, boolean onlyIfAbsent) {
    if (key == null || value == null) throw new NullPointerException();
    int hash = spread(key.hashCode());
    int binCount = 0;
    for (Node<K,V>[] tab = table;;) {
        Node<K,V> f; int n, i, fh;
        // 1. 数组未初始化，先初始化
        if (tab == null || (n = tab.length) == 0)
            tab = initTable();
        // 2. 当前桶为空，CAS 无锁插入
        else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
            if (casTabAt(tab, i, null,
                         new Node<K,V>(hash, key, value, null)))
                break; // 插入成功，退出自旋
        }
        // 3. 正在扩容，帮助扩容
        else if ((fh = f.hash) == MOVED)
            tab = helpTransfer(tab, f);
        // 4. 桶非空且不在扩容：冲突处理（链表/红黑树）
        else {
            V oldVal = null;
            synchronized (f) {  // 只锁当前桶的头节点，粒度很细
                if (tabAt(tab, i) == f) {
                    // 4.1 普通链表
                    if (fh >= 0) {
                        binCount = 1;
                        for (Node<K,V> e = f;; ++binCount) {
                            K ek;
                            if (e.hash == hash &&
                                ((ek = e.key) == key ||
                                 (ek != null && key.equals(ek)))) {
                                // key 已存在
                                oldVal = e.val;
                                if (!onlyIfAbsent)
                                    e.val = value;
                                break;
                            }
                            Node<K,V> pred = e;
                            if ((e = e.next) == null) {
                                // 尾插法
                                pred.next = new Node<K,V>(hash, key, value, null);
                                break;
                            }
                        }
                    }
                    // 4.2 红黑树插入
                    else if (f instanceof TreeBin) {
                        Node<K,V> p;
                        binCount = 2;
                        if ((p = ((TreeBin<K,V>)f)
                                .putTreeVal(hash, key, value)) != null) {
                            oldVal = p.val;
                            if (!onlyIfAbsent)
                                p.val = value;
                        }
                    }
                }
            }
            if (binCount != 0) {
                // 链表长度达到阈值，尝试树化
                if (binCount >= TREEIFY_THRESHOLD)
                    treeifyBin(tab, i);
                if (oldVal != null)
                    return oldVal;
                break;
            }
        }
    }
    // 5. 计数 + 检查扩容
    addCount(1L, binCount);
    return null;
}
```

可以抽象成下面的逻辑顺序：

1. 计算 hash。
2. 如果 table 未初始化，则 `initTable()`。
3. 如果目标桶为空，通过 CAS 直接插入，**无锁**。
4. 如果桶头是 `ForwardingNode`（hash = MOVED），说明在扩容，调用 `helpTransfer` 协助扩容。
5. 否则，锁住桶头节点：
   - 如果是链表：遍历链表，存在 key 则更新，不存在则尾插。
   - 如果是红黑树：调用 `TreeBin.putTreeVal`。
6. 如果链表长度达到 8，尝试树化（但如果 table 长度不足 64，会优先扩容）。
7. 调用 `addCount` 增加元素数量，并视情况触发扩容。

------

## 七、initTable：延迟初始化与 sizeCtl

ConcurrentHashMap 的数组是“延迟初始化”的，第一个 put 时才真正分配内存。

```java
private final Node<K,V>[] initTable() {
    Node<K,V>[] tab; int sc;
    while ((tab = table) == null || tab.length == 0) {
        if ((sc = sizeCtl) < 0)         // 其他线程正在初始化
            Thread.yield();
        else if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {
            try {
                if ((tab = table) == null || tab.length == 0) {
                    int n = (sc > 0) ? sc : DEFAULT_CAPACITY; // 初始容量
                    @SuppressWarnings("unchecked")
                    Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                    table = tab = nt;
                    // 设置下一次扩容的阈值：n * 0.75
                    sc = n - (n >>> 2);
                }
            } finally {
                sizeCtl = sc;
            }
            break;
        }
    }
    return tab;
}
```

要点：

- 使用 `sizeCtl` + CAS 确保只有一个线程真正做初始化，其余线程自旋 + yield。
- 初始化完成后，`sizeCtl` 被设置为扩容阈值（capacity * 0.75）。

------

## 八、get 流程：无锁读的关键

源码非常简洁：

```java
public V get(Object key) {
    Node<K,V>[] tab; Node<K,V> e, p; int n, eh; K ek;
    int h = spread(key.hashCode());
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (e = tabAt(tab, (n - 1) & h)) != null) {
        if ((eh = e.hash) == h) {
            if ((ek = e.key) == key || (ek != null && key.equals(ek)))
                return e.val;
        } else if (eh < 0) {
            // TreeBin 或 ForwardingNode，调用其 find
            return (p = e.find(h, key)) != null ? p.val : null;
        }
        while ((e = e.next) != null) {
            if (e.hash == h &&
                ((ek = e.key) == key || (ek != null && key.equals(ek))))
                return e.val;
        }
    }
    return null;
}
```

特点：

- 全程没有加任何锁。

- 依赖`Node` 的`val` 和`next`的`volatile`

  可见性，以及结构上的“只增不乱改”：

  - 链表结构的插入发生在 `synchronized` 块中，更新 `next` 是有序的。
  - 扩容时会通过 `ForwardingNode` 将读操作引导到新表。

------

## 九、扩容机制：transfer 与多线程协作

扩容是 ConcurrentHashMap 中最复杂也最精妙的部分。

### 9.1 何时扩容？

触发扩容的主要途径是在 `addCount` 中：

- 当总元素个数 `>= sizeCtl` 时，考虑扩容。
- 多线程可协作迁移，减少“某个线程单独搬一整张表”的耗时。

### 9.2 addCount：计数 + 触发扩容

这里只看与扩容相关的逻辑（省略计数细节）：

```java
private final void addCount(long x, int check) {
    // 1. 计数逻辑（baseCount + CounterCell[]），略

    if (check >= 0) {
        Node<K,V>[] tab, nt; int n, sc;
        while ((s = sumCount()) >= (long)(sc = sizeCtl) &&
               (tab = table) != null &&
               (n = tab.length) < MAXIMUM_CAPACITY) {

            int rs = resizeStamp(n);
            if (sc < 0) { // 已经在扩容了
                if ((sc >>> RESIZE_STAMP_SHIFT) != rs || sc == rs + 1 ||
                    sc == rs + MAX_RESIZERS ||
                    (nt = nextTable) == null || transferIndex <= 0)
                    break;
                if (U.compareAndSwapInt(this, SIZECTL, sc, sc + 1))
                    transfer(tab, nt); // 帮忙扩容
            }
            // 当前线程发起扩容
            else if (U.compareAndSwapInt(this, SIZECTL, sc,
                    (rs << RESIZE_STAMP_SHIFT) + 2))
                transfer(tab, null); // 开启扩容
        }
    }
}
```

关键点：

- `resizeStamp(n)` 生成一个与数组长度 `n` 相关的标记值，用于在 `sizeCtl` 中编码“这是一次哪个容量的扩容”。
- `sizeCtl < 0` 表示在扩容中，低 16 位编码已经参与扩容的线程数量。
- 多个线程可以一起调用 `transfer`，提升扩容速度。

### 9.3 transfer：多线程迁移数据（简化讲解）

完整源码较长，这里抽象出核心思想：

1. **第一次进入 transfer 时**：

   - 若 `nextTable == null`，创建新数组 `capacity * 2`。
   - 设置 `nextTable = newTable`。
   - 设置 `transferIndex = oldCapacity`，表示“还有多少桶没有迁移”。

2. **多个线程协作分段迁移**：

   - 每个线程通过 CAS 从`transferIndex`中领取一段区间，例如一次领取 stride 个桶索引：

     ```java
     // 伪代码
     while (transferIndex > 0) {
         int hi = transferIndex;
         int lo = Math.max(0, hi - stride);
         if (CAS(transferIndex, hi, lo)) {
             // 本线程负责迁移 [lo, hi) 区间的桶
         }
     }
     ```

3. **迁移某个桶的逻辑**：

   - 如果 `tab[i] == null`，则直接在旧数组该位置写入一个 `ForwardingNode`，表示迁移完成。
   - 如果 `tab[i]` 已经是 `ForwardingNode`，说明别的线程处理过，跳过。
   - 否则，锁住`tab[i]`（桶头节点），将链表或树拆分为两个链表/树：
     - 利用 `(hash & oldCap)`的结果区分“低位链表”和“高位链表”：
       - `hash & oldCap == 0` 的节点，位置不变，仍在 `index`。
       - `hash & oldCap != 0` 的节点，新位置 = `index + oldCap`。
   - 拆分完后：
     - 在新数组 `nextTable` 的 `i`、`i + n` 放入新链表/树。
     - 在旧数组 `tab[i]` 放入 `ForwardingNode(nextTable)`。

4. **迁移结束**：

   - 当所有桶都被标记为`ForwardingNode`且没线程在迁移：
     - 将 `table` 指向 `nextTable`。
     - `nextTable = null`。
     - `sizeCtl` 设置为新阈值（`newCap * 0.75`）。

### 9.4 高低位拆分的小技巧

这是 HashMap / ConcurrentHashMap 扩容的经典技巧：

- 扩容前数组长度：`n`（2 的幂）。
- 扩容后数组长度：`2n`。
- 元素原索引：`idx = hash & (n - 1)`。
- 扩容后，新索引要么还是 `idx`，要么是 `idx + n`。

判断方式：

```java
if ((hash & n) == 0)
    // 低位链表，位置不变
else
    // 高位链表，新位置 = idx + n
```

好处：

- 无需重新计算 hash。
- 迁移时时间复杂度为 O(链表长度)，不会额外放大。

------

## 十、计数实现：baseCount + CounterCell（LongAdder 思想）

### 10.1 为什么不用一个 AtomicLong 计数？

如果简单用一个 `AtomicLong count`：

```java
put() {
    // ...
    count.incrementAndGet();
}
```

在高并发下，所有线程都会竞争这一个变量的 CAS，自旋严重，性能很差。

### 10.2 ConcurrentHashMap 的做法

借鉴 `LongAdder` 的思想，把计数“分段”：

```java
transient volatile long baseCount;          // 基础计数
transient volatile CounterCell[] counterCells;

@sun.misc.Contended
static final class CounterCell {
    volatile long value;
    CounterCell(long x) { value = x; }
}
```

- 低并发时，直接 CAS 修改 `baseCount`。
- 高并发 CAS 失败严重时，分配 `counterCells` 数组，线程根据随机 probe 选择一个 cell 累加，降低冲突概率。
- `size()` 时通过 `sumCount()` 把 `baseCount` + 所有 `CounterCell` 的值累加起来。

```java
final long sumCount() {
    CounterCell[] as = counterCells; CounterCell a;
    long sum = baseCount;
    if (as != null) {
        for (int i = 0; i < as.length; ++i) {
            if ((a = as[i]) != null)
                sum += a.value;
        }
    }
    return sum;
}
```

注意：这意味着 `size()` 在并发情况下是“近似值”，不保证绝对精确。

------

## 十一、链表与红黑树的转换

### 11.1 何时树化？

- 条件一：**链表长度 >= 8**。
- 条件二：整个 table 的长度 >= 64，否则优先扩容而非树化。

源码片段（关键逻辑）：

```java
static final int TREEIFY_THRESHOLD = 8;
static final int MIN_TREEIFY_CAPACITY = 64;

private final void treeifyBin(Node<K,V>[] tab, int index) {
    Node<K,V> b; int n;
    if (tab != null) {
        if ((n = tab.length) < MIN_TREEIFY_CAPACITY)
            tryPresize(n << 1);  // 先扩容
        else if ((b = tabAt(tab, index)) != null && b.hash >= 0) {
            synchronized (b) {
                // 把链表节点包装成 TreeNode，挂到 TreeBin 中
                // 省略细节...
                setTabAt(tab, index, new TreeBin<K,V>(hd));
            }
        }
    }
}
```

设计意图：

- 小容量时，扩容就能大幅降低碰撞，没必要引入更复杂的红黑树结构。
- 只有在容量足够大、碰撞仍频繁时，才树化。

### 11.2 红黑树何时退化为链表？

拆分树节点时，如果某一边的节点数量低于 `UNTREEIFY_THRESHOLD`（6），则退化为链表，避免小链表维护红黑树带来的额外开销。

------

## 十二、常见面试问题总结

### 1. 为什么 ConcurrentHashMap 的 key 和 value 不能为 null？

因为在并发环境中：

- `get(key)` 返回 null，无法判断是“key 不存在”还是“key 对应的值是 null”。
- 如果再通过 `containsKey` 去判断，中间 Map 可能已被其他线程修改。

为避免这种语义上的歧义，ConcurrentHashMap 直接禁止使用 null 作为 key 或 value。

### 2. JDK 7 和 JDK 8 的 ConcurrentHashMap 主要区别？

简表：

| 维度     | JDK 7                      | JDK 8                                     |
| -------- | -------------------------- | ----------------------------------------- |
| 结构     | Segment[] + HashEntry[]    | Node[] + 链表/红黑树                      |
| 锁       | Segment 继承 ReentrantLock | synchronized 锁桶头节点 + CAS             |
| 并发度   | Segment 数量（默认 16）    | 与数组长度近似，理论上更高                |
| 扩容     | Segment 内部独立扩容       | 整表扩容，多线程协作迁移                  |
| 冲突处理 | 链表                       | 链表 + 红黑树                             |
| 计数实现 | Segment 内 count 累加      | baseCount + CounterCell（LongAdder 思想） |

### 3. ConcurrentHashMap 为什么从 ReentrantLock 改成 synchronized？

主要原因：

1. JDK 6+ 对 synchronized 做了大量优化（偏向锁、轻量级锁、自旋锁等），性能已经非常好。
2. synchronized 是 JVM 级别的原语，配合对象头的 Mark Word 可以更高效、内存占用更小。
3. 锁粒度从 Segment 降到桶（Node 头节点），加锁范围更小，冲突概率更低。

### 4. get 为什么不需要加锁还能保证线程安全？

- Node 的 `val` 和 `next` 都是 volatile，保证可见性。
- 结构调整（插入、扩容）发生在锁内，写入顺序有保证。
- 扩容时通过 ForwardingNode 将读取引导到新表上。

因此读取可以在无锁的情况下进行，并且保证了“足够一致”的可见性。

------

## 结语

从 JDK 7 的 Segment 分段锁，到 JDK 8 的数组 + 链表/红黑树 + CAS + synchronized，ConcurrentHashMap 的演进体现了 Java 并发库对：

- 锁粒度控制
- 无锁/少锁编程
- 多线程协作扩容
- 内存布局与 CPU 缓存友好性

等方面的深度思考。

如果你能真正读懂 ConcurrentHashMap 的源码，对 Java 并发模型、锁优化、CAS 原理、红黑树等核心知识都会有一个更系统的理解。

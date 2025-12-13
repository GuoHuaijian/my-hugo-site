---
title: "Kafka入门学习指南"
date: 2025-12-05
author: "Guo"
tags: ["学习笔记", "Kafka", "消息队列"]
comments: true
toc: true
---

## 1. Kafka 概述与应用场景

### 1.1 什么是 Kafka？

**Apache Kafka** 是由 LinkedIn 开发并开源的**分布式流处理平台**，最初被设计为一个高吞吐量的分布式消息系统。它具有以下核心特性：

| 特性         | 说明                     |
| ------------ | ------------------------ |
| **高吞吐量** | 单机可达百万级 TPS       |
| **低延迟**   | 毫秒级延迟               |
| **高可用**   | 分布式架构，支持副本机制 |
| **持久化**   | 消息持久化到磁盘         |
| **可扩展**   | 水平扩展能力强           |
| **流处理**   | 支持实时流处理           |

### 1.2 Kafka vs 传统消息队列

```mermaid
graph TB
    subgraph "传统消息队列 (RabbitMQ/ActiveMQ)"
        A1[消息被消费后删除]
        A2[单个消费者]
        A3[内存为主]
        A4[适合小数据量]
    end
    
    subgraph "Kafka"
        B1[消息持久化保留]
        B2[多消费者组并行消费]
        B3[磁盘顺序写]
        B4[适合大数据量/流处理]
    end
    
    style B1 fill:#90EE90
    style B2 fill:#90EE90
    style B3 fill:#90EE90
    style B4 fill:#90EE90
```

**核心差异解释：**

1. **消息保留策略**：传统MQ消费后删除，Kafka基于时间/大小保留
2. **消费模式**：Kafka支持多消费者组独立消费同一份数据
3. **存储设计**：Kafka专为磁盘顺序I/O优化，吞吐量极高
4. **定位不同**：传统MQ侧重解耦，Kafka侧重数据管道和流处理

### 1.3 典型应用场景

```mermaid
mindmap
  root((Kafka应用场景))
    消息系统
      系统解耦
      异步处理
      流量削峰
    日志收集
      应用日志
      监控数据
      审计日志
    流处理
      实时ETL
      实时分析
      CEP复杂事件处理
    数据集成
      数据同步
      CDC变更捕获
      数据湖摄入
    事件驱动架构
      微服务通信
      事件溯源
      CQRS模式
```

---

## 2. 核心概念与术语

### 2.1 概念全景图

```mermaid
graph TB
    subgraph KafkaCluster["Kafka Cluster"]
        subgraph Broker1["Broker 1"]
            B1[(Broker 1)]
            T1P0[Topic1-Partition0<br/>Leader]
            T1P1[Topic1-Partition1<br/>Follower]
            T2P0[Topic2-Partition0<br/>Follower]
        end

        subgraph Broker2["Broker 2"]
            B2[(Broker 2)]
            T1P0F[Topic1-Partition0<br/>Follower]
            T1P1L[Topic1-Partition1<br/>Leader]
            T2P0L[Topic2-Partition0<br/>Leader]
        end

        subgraph Broker3["Broker 3"]
            B3[(Broker 3)]
            T1P0F2[Topic1-Partition0<br/>Follower]
            T1P1F[Topic1-Partition1<br/>Follower]
            T2P1[Topic2-Partition1<br/>Leader]
        end
    end

    Producer1[Producer] --> T1P0
    Producer1 --> T1P1L

    subgraph CGA["Consumer Group A"]
        C1[Consumer 1]
        C2[Consumer 2]
    end

    subgraph CGB["Consumer Group B"]
        C3[Consumer 3]
    end

    T1P0 --> C1
    T1P1L --> C2
    T1P0 --> C3
    T1P1L --> C3

    ZK[(ZooKeeper<br/>/ KRaft)] --> B1
    ZK --> B2
    ZK --> B3

```

### 2.2 核心术语详解

| 术语               | 英文             | 详细说明                                                     |
| ------------------ | ---------------- | ------------------------------------------------------------ |
| **Broker**         | 代理服务器       | Kafka服务实例，负责接收、存储、转发消息。一个Kafka集群由多个Broker组成，每个Broker有唯一ID |
| **Topic**          | 主题             | 消息的逻辑分类，类似于数据库的表。生产者向Topic发消息，消费者从Topic订阅消息 |
| **Partition**      | 分区             | Topic的物理分片，是Kafka并行度的基本单位。每个Partition是有序的、不可变的消息序列 |
| **Replica**        | 副本             | Partition的备份，分为Leader和Follower。保证数据高可用        |
| **Leader**         | 领导者副本       | 负责处理该Partition所有的读写请求                            |
| **Follower**       | 跟随者副本       | 被动从Leader同步数据，当Leader宕机时可被选举为新Leader       |
| **Producer**       | 生产者           | 消息的发送方，负责将消息发布到指定Topic                      |
| **Consumer**       | 消费者           | 消息的接收方，从Topic订阅并处理消息                          |
| **Consumer Group** | 消费者组         | 一组Consumer的集合，组内Consumer共同消费Topic，实现负载均衡  |
| **Offset**         | 偏移量           | 消息在Partition中的唯一标识，是一个递增的长整数              |
| **ISR**            | In-Sync Replicas | 与Leader保持同步的副本集合，包括Leader本身                   |
| **HW**             | High Watermark   | 高水位，消费者能看到的最大offset                             |
| **LEO**            | Log End Offset   | 日志末端偏移量，下一条消息将要写入的位置                     |

### 2.3 消息模型图解

```mermaid
graph LR
    subgraph "Topic: order-events"
        subgraph "Partition 0"
            M00[Offset 0<br/>Order-001]
            M01[Offset 1<br/>Order-004]
            M02[Offset 2<br/>Order-007]
            M03[Offset 3<br/>Order-010]
            M00 --> M01 --> M02 --> M03
        end
        
        subgraph "Partition 1"
            M10[Offset 0<br/>Order-002]
            M11[Offset 1<br/>Order-005]
            M12[Offset 2<br/>Order-008]
            M10 --> M11 --> M12
        end
        
        subgraph "Partition 2"
            M20[Offset 0<br/>Order-003]
            M21[Offset 1<br/>Order-006]
            M22[Offset 2<br/>Order-009]
            M20 --> M21 --> M22
        end
    end
    
    style M03 fill:#FFD700
    style M12 fill:#FFD700
    style M22 fill:#FFD700
```

**关键理解：**
- 每个Partition内消息严格有序，但跨Partition不保证顺序
- Offset在每个Partition内独立编号
- 新消息追加到Partition末尾（Append-Only）

---

## 3. 整体架构设计

### 3.1 完整架构图

```mermaid
flowchart TB
    subgraph Producers["生产者集群"]
        P1[Producer 1]
        P2[Producer 2]
        P3[Producer N]
    end

    subgraph KafkaCluster["Kafka Cluster"]
        subgraph Broker1["Broker 1 (Controller)"]
            B1P1[Partition 1-0<br/>Leader]
            B1P2[Partition 2-1<br/>Follower]
        end
        subgraph Broker2["Broker 2"]
            B2P1[Partition 1-0<br/>Follower]
            B2P2[Partition 2-0<br/>Leader]
        end
        subgraph Broker3["Broker 3"]
            B3P1[Partition 1-1<br/>Leader]
            B3P2[Partition 2-0<br/>Follower]
        end
        
        B1P1 -.同步.-> B2P1
        B2P2 -.同步.-> B3P2
    end

    subgraph Consumers["消费者集群"]
        subgraph CG1["Consumer Group 1"]
            C1[Consumer 1]
            C2[Consumer 2]
        end
        subgraph CG2["Consumer Group 2"]
            C3[Consumer 3]
        end
    end

    subgraph Coordination["协调层"]
        ZK[(ZooKeeper)]
        KRaft[(KRaft<br/>Kafka 3.x+)]
    end

    P1 & P2 & P3 --> KafkaCluster
    KafkaCluster --> C1 & C2 & C3
    Coordination <--> KafkaCluster
```

### 3.2 数据流转过程

```mermaid
sequenceDiagram
    participant P as Producer
    participant LB as 负载均衡/分区器
    participant L as Leader Broker
    participant F1 as Follower 1
    participant F2 as Follower 2
    participant C as Consumer

    P->>LB: 1. 发送消息
    LB->>LB: 2. 选择目标Partition
    LB->>L: 3. 路由到Leader
    L->>L: 4. 写入本地日志
    
    par 异步复制
        L->>F1: 5a. 同步到Follower1
        L->>F2: 5b. 同步到Follower2
    end
    
    F1-->>L: 6a. ACK
    F2-->>L: 6b. ACK
    L->>L: 7. 更新HW
    L-->>P: 8. 返回成功
    
    C->>L: 9. 拉取消息(offset=X)
    L-->>C: 10. 返回消息
    C->>C: 11. 处理消息
    C->>L: 12. 提交offset
```

**流程详解：**

1. **发送阶段**：Producer将消息发送到Kafka
2. **路由阶段**：根据分区策略确定目标Partition
3. **Leader写入**：只有Leader副本接收写请求
4. **本地持久化**：消息写入Leader的本地日志文件
5. **副本同步**：Follower从Leader拉取数据进行同步
6. **确认机制**：根据acks配置决定何时返回成功
7. **消费拉取**：Consumer主动从Broker拉取消息
8. **Offset管理**：Consumer定期提交消费进度

---

## 4. Topic 与 Partition 机制

### 4.1 Partition 设计原理

```mermaid
graph TB
    subgraph "为什么需要Partition?"
        A[单一队列] --> B[吞吐量瓶颈]
        A --> C[单点故障风险]
        A --> D[存储容量限制]
    end
    
    subgraph "Partition解决方案"
        E[数据分片] --> F[并行处理提升吞吐]
        E --> G[分布式存储突破容量]
        E --> H[副本机制保证可用性]
    end
    
    B -.-> F
    C -.-> H
    D -.-> G
```

**Partition 核心价值：**

1. **水平扩展**：数据分布在多个Broker上，突破单机存储和性能限制
2. **并行处理**：多个Consumer可以并行消费不同Partition
3. **顺序保证**：单Partition内消息严格有序
4. **负载均衡**：消息均匀分布到各Partition

### 4.2 分区分配策略

```mermaid
flowchart LR
    subgraph "消息Key"
        K1["key=null"]
        K2["key=user_001"]
        K3["key=user_002"]
    end
    
    subgraph "分区策略"
        S1["轮询 Round-Robin"]
        S2["Hash(key) % 分区数"]
        S3["自定义 Partitioner"]
    end
    
    subgraph "目标分区"
        P0["Partition 0"]
        P1["Partition 1"]
        P2["Partition 2"]
    end
    
    K1 --> S1 --> P0
    K1 --> S1 --> P1
    K1 --> S1 --> P2
    
    K2 --> S2 --> P1
    K3 --> S2 --> P2
```

**分区策略详解：**

| 策略                 | 适用场景          | 说明                              |
| -------------------- | ----------------- | --------------------------------- |
| **轮询(RoundRobin)** | 无需保证顺序      | key为null时默认使用，消息均匀分布 |
| **Key Hash**         | 相同key需保证顺序 | 相同key的消息路由到同一分区       |
| **粘性分区**         | Kafka 2.4+ 默认   | 批量发送到同一分区，减少请求数    |
| **自定义**           | 特殊业务需求      | 实现Partitioner接口               |

### 4.3 分区数量选择

```mermaid
graph LR
    subgraph "分区数过少"
        A1[吞吐量受限]
        A2[Consumer并行度低]
        A3[热点问题]
    end
    
    subgraph "分区数过多"
        B1[文件句柄消耗大]
        B2[Leader选举慢]
        B3[端到端延迟增加]
        B4[内存占用增加]
    end
    
    subgraph "最佳实践"
        C1["分区数 = max(T/Tp, T/Tc)"]
        C2["T = 目标吞吐量"]
        C3["Tp = 单分区生产吞吐"]
        C4["Tc = 单分区消费吞吐"]
    end
```

**分区数经验公式：**
```
分区数 = max(预期吞吐量/单分区生产吞吐量, 预期吞吐量/单分区消费吞吐量)
```

**建议原则：**
- 起步建议：分区数 = Broker数量 × 2~3
- 单个分区吞吐约 10MB/s ~ 30MB/s
- 分区数建议为Broker数量的整数倍

---

## 5. 生产者原理

### 5.1 生产者架构

```mermaid
flowchart TB
    subgraph "Producer客户端"
        subgraph "主线程"
            A[用户调用send]
            B[拦截器Interceptor]
            C[序列化器Serializer]
            D[分区器Partitioner]
        end
        
        subgraph "RecordAccumulator"
            E[Batch 1<br/>Partition 0]
            F[Batch 2<br/>Partition 1]
            G[Batch 3<br/>Partition 2]
        end
        
        subgraph "Sender线程"
            H[批量发送]
            I[InFlightRequests]
        end
    end
    
    A --> B --> C --> D
    D --> E
    D --> F
    D --> G
    E & F & G --> H --> I
    
    I --> J[Broker]
    J --> K[响应/重试]
    K --> I
```

### 5.2 发送流程详解

```mermaid
sequenceDiagram
    participant App as 应用程序
    participant Inter as 拦截器链
    participant Ser as 序列化器
    participant Part as 分区器
    participant Acc as 消息累加器
    participant Send as Sender线程
    participant Broker as Kafka Broker

    App->>Inter: 1. send(record)
    Inter->>Inter: 2. onSend()处理
    Inter->>Ser: 3. 传递消息
    Ser->>Ser: 4. 序列化Key/Value
    Ser->>Part: 5. 传递序列化数据
    Part->>Part: 6. 计算目标分区
    Part->>Acc: 7. 追加到对应批次
    
    Note over Acc: 等待batch.size或linger.ms
    
    Acc->>Send: 8. 批次就绪
    Send->>Send: 9. 构建请求
    Send->>Broker: 10. 发送ProduceRequest
    Broker-->>Send: 11. ProduceResponse
    
    alt 成功
        Send->>Inter: 12. onAcknowledgement()
        Inter->>App: 13. Callback成功
    else 失败且可重试
        Send->>Send: 14. 重试
    else 失败不可重试
        Send->>App: 15. Callback异常
    end
```

### 5.3 核心配置参数

```mermaid
graph TB
    subgraph "可靠性配置"
        A1["acks=0: 不等待确认"]
        A2["acks=1: Leader确认"]
        A3["acks=all/-1: ISR全部确认"]
    end
    
    subgraph "性能配置"
        B1["batch.size: 批次大小<br/>默认16KB"]
        B2["linger.ms: 等待时间<br/>默认0"]
        B3["buffer.memory: 缓冲区<br/>默认32MB"]
        B4["compression.type: 压缩<br/>none/gzip/snappy/lz4/zstd"]
    end
    
    subgraph "重试配置"
        C1["retries: 重试次数"]
        C2["retry.backoff.ms: 重试间隔"]
        C3["max.in.flight.requests.per.connection"]
    end
```

### 5.4 ACK机制详解

```mermaid
flowchart LR
    subgraph "acks=0"
        A1[Producer发送] --> A2[不等待响应]
        A2 --> A3[继续发送下一条]
        style A2 fill:#FF6B6B
    end
    
    subgraph "acks=1"
        B1[Producer发送] --> B2[Leader写入成功]
        B2 --> B3[返回确认]
        style B2 fill:#FFE66D
    end
    
    subgraph "acks=all"
        C1[Producer发送] --> C2[Leader写入]
        C2 --> C3[等待ISR副本同步]
        C3 --> C4[全部确认后返回]
        style C3 fill:#4ECDC4
        style C4 fill:#4ECDC4
    end
```

| acks值 | 可靠性 | 吞吐量 | 说明                                     |
| ------ | ------ | ------ | ---------------------------------------- |
| 0      | 最低   | 最高   | 发送即忘，可能丢消息                     |
| 1      | 中等   | 中等   | Leader确认，可能因Leader宕机丢消息       |
| all/-1 | 最高   | 最低   | ISR全部确认，配合min.insync.replicas使用 |

### 5.5 幂等与事务

```mermaid
graph TB
    subgraph "幂等Producer (enable.idempotence=true)"
        A1[Producer] -->|"PID + Sequence"| A2[Broker]
        A2 -->|去重| A3[存储]
        
        A4["解决: 网络重试导致的重复"]
    end
    
    subgraph "事务Producer"
        B1[beginTransaction]
        B2[send to topic-A]
        B3[send to topic-B]
        B4[sendOffsetsToTransaction]
        B5[commitTransaction]
        
        B1 --> B2 --> B3 --> B4 --> B5
        B6["解决: 跨分区/跨Topic原子性"]
    end
```

**幂等原理：**
- 每个Producer分配唯一PID（Producer ID）
- 每条消息携带递增的Sequence Number
- Broker通过<PID, Partition, SeqNum>去重
- 解决单分区内的重复问题

**事务原理：**
- 引入Transaction Coordinator协调者
- 通过两阶段提交保证原子性
- 支持跨分区、跨Topic的事务

---

## 6. 消费者原理

### 6.1 消费者组机制

```mermaid
graph TB
    subgraph "Topic: orders (3个分区)"
        P0[Partition 0]
        P1[Partition 1]
        P2[Partition 2]
    end
    
    subgraph "Consumer Group A"
        CA1[Consumer A1]
        CA2[Consumer A2]
        CA3[Consumer A3]
    end
    
    subgraph "Consumer Group B"
        CB1[Consumer B1]
    end
    
    P0 --> CA1
    P1 --> CA2
    P2 --> CA3
    
    P0 --> CB1
    P1 --> CB1
    P2 --> CB1
    
    Note1["Group A: 3个消费者<br/>每个消费1个分区"]
    Note2["Group B: 1个消费者<br/>消费全部3个分区"]
```

**核心规则：**
1. **组内互斥**：一个分区只能被组内一个Consumer消费
2. **组间独立**：不同组独立消费，互不影响
3. **最大并行度**：Consumer数量 ≤ 分区数（多余Consumer空闲）

### 6.2 分区分配策略

```mermaid
flowchart TB
    subgraph "Range策略"
        R1["Topic1: P0,P1,P2,P3,P4"]
        R2["Consumer1: P0,P1,P2"]
        R3["Consumer2: P3,P4"]
        R1 --> R2
        R1 --> R3
    end
    
    subgraph "RoundRobin策略"
        RR1["Topic1: P0,P1,P2,P3,P4"]
        RR2["Consumer1: P0,P2,P4"]
        RR3["Consumer2: P1,P3"]
        RR1 --> RR2
        RR1 --> RR3
    end
    
    subgraph "Sticky策略"
        S1["尽量保持原有分配"]
        S2["减少分区迁移"]
        S3["Rebalance更平滑"]
    end
    
    subgraph "CooperativeSticky策略"
        CS1["渐进式Rebalance"]
        CS2["不中断其他消费者"]
        CS3["Kafka 2.4+推荐"]
    end
```

| 策略                  | 特点                    | 适用场景          |
| --------------------- | ----------------------- | ----------------- |
| **Range**             | 按Topic分配，可能不均匀 | 单Topic场景       |
| **RoundRobin**        | 全局轮询，较均匀        | 多Topic场景       |
| **Sticky**            | 尽量维持原分配          | 减少Rebalance开销 |
| **CooperativeSticky** | 增量式Rebalance         | Kafka 2.4+ 推荐   |

### 6.3 消费流程

```mermaid
sequenceDiagram
    participant C as Consumer
    participant Coord as GroupCoordinator
    participant Leader as Partition Leader
    
    Note over C,Coord: 加入消费者组
    C->>Coord: 1. FindCoordinator
    Coord-->>C: 2. Coordinator地址
    C->>Coord: 3. JoinGroup
    Coord->>Coord: 4. 等待其他成员
    Coord-->>C: 5. JoinGroup Response<br/>(Leader分配方案)
    C->>Coord: 6. SyncGroup
    Coord-->>C: 7. 分区分配结果
    
    Note over C,Leader: 拉取消息
    loop 消费循环
        C->>Leader: 8. Fetch请求
        Leader-->>C: 9. 返回消息批次
        C->>C: 10. 处理消息
        C->>Coord: 11. 提交Offset
        C->>Coord: 12. 心跳(异步)
    end
```

### 6.4 Offset 管理

```mermaid
graph TB
    subgraph "Offset存储演进"
        A1["Kafka 0.8-<br/>存储在ZooKeeper"]
        A2["Kafka 0.9+<br/>存储在内部Topic"]
        A1 --> A2
    end
    
    subgraph "__consumer_offsets Topic"
        B1["Key: group+topic+partition"]
        B2["Value: offset + metadata"]
        B3["默认50个分区"]
        B4["压缩策略: compact"]
    end
    
    subgraph "提交方式"
        C1["自动提交<br/>enable.auto.commit=true"]
        C2["同步提交<br/>commitSync()"]
        C3["异步提交<br/>commitAsync()"]
        C4["指定Offset提交"]
    end
```

### 6.5 Rebalance 机制

```mermaid
stateDiagram-v2
    [*] --> Stable: 初始化完成
    Stable --> PreparingRebalance: 触发条件
    PreparingRebalance --> CompletingRebalance: 收集成员
    CompletingRebalance --> Stable: 分配完成
    
    note right of PreparingRebalance
        触发条件:
        1. 新Consumer加入
        2. Consumer离开/崩溃
        3. 订阅Topic变化
        4. 分区数变化
    end note
```

**Rebalance 问题与优化：**

```mermaid
graph TB
    subgraph "Rebalance问题"
        P1[消费暂停]
        P2[重复消费风险]
        P3[频繁Rebalance影响稳定性]
    end
    
    subgraph "优化措施"
        O1["增大session.timeout.ms"]
        O2["调整heartbeat.interval.ms"]
        O3["增大max.poll.interval.ms"]
        O4["使用静态成员group.instance.id"]
        O5["使用CooperativeStickyAssignor"]
    end
    
    P1 -.-> O5
    P3 -.-> O1
    P3 -.-> O4
```

---

## 7. 消息存储机制

### 7.1 存储结构

```mermaid
graph TB
    subgraph "磁盘目录结构"
        Root["/kafka-logs"]
        T1["topic1-0/"]
        T2["topic1-1/"]
        T3["topic2-0/"]
        
        Root --> T1
        Root --> T2
        Root --> T3
        
        subgraph "Partition目录"
            S1["00000000000000000000.log<br/>(数据文件)"]
            S2["00000000000000000000.index<br/>(偏移量索引)"]
            S3["00000000000000000000.timeindex<br/>(时间戳索引)"]
            S4["00000000000000368769.log"]
            S5["00000000000000368769.index"]
        end
        
        T1 --> S1
        T1 --> S2
        T1 --> S3
        T1 --> S4
        T1 --> S5
    end
```

### 7.2 日志分段机制

```mermaid
flowchart LR
    subgraph "LogSegment 分段"
        Seg1["Segment 1<br/>offset: 0-368768"]
        Seg2["Segment 2<br/>offset: 368769-737537"]
        Seg3["Segment 3 (Active)<br/>offset: 737538-..."]
        
        Seg1 --> Seg2 --> Seg3
    end
    
    New[新消息] --> Seg3
    
    subgraph "分段条件"
        C1["log.segment.bytes=1GB"]
        C2["log.roll.hours=168"]
        C3["log.roll.ms"]
    end
```

**分段好处：**
1. 方便删除旧数据，直接删除整个Segment文件
2. 提高查询效率，只需搜索相关Segment
3. 支持并发读写

### 7.3 索引机制

```mermaid
graph LR
    subgraph "稀疏索引"
        I1["Offset 0 -> Position 0"]
        I2["Offset 1024 -> Position 32768"]
        I3["Offset 2048 -> Position 65536"]
    end
    
    subgraph "查找过程"
        Q1["查找Offset 1500"]
        Q2["二分查找索引<br/>定位到1024"]
        Q3["从Position 32768<br/>顺序扫描"]
        Q4["找到Offset 1500"]
        
        Q1 --> Q2 --> Q3 --> Q4
    end
```

### 7.4 消息格式

```mermaid
graph TB
    subgraph "消息格式 V2 (Kafka 0.11+)"
        subgraph "RecordBatch (批次)"
            B1["baseOffset: 8字节"]
            B2["batchLength: 4字节"]
            B3["magic: 1字节"]
            B4["crc: 4字节"]
            B5["attributes: 2字节<br/>(压缩/事务/时间戳类型)"]
            B6["lastOffsetDelta"]
            B7["producerId/epoch"]
            B8["Records[]"]
        end
        
        subgraph "Record (单条消息)"
            R1["length: varint"]
            R2["attributes: 1字节"]
            R3["timestampDelta"]
            R4["offsetDelta"]
            R5["keyLength + key"]
            R6["valueLength + value"]
            R7["Headers[]"]
        end
    end
```

### 7.5 日志清理策略

```mermaid
graph TB
    subgraph "Delete策略"
        D1["基于时间: log.retention.hours=168"]
        D2["基于大小: log.retention.bytes=-1"]
        D3["删除整个过期Segment"]
    end
    
    subgraph "Compact策略"
        C1["相同Key保留最新Value"]
        C2["用于Changelog/状态存储"]
        C3["__consumer_offsets使用此策略"]
    end
    
    subgraph "Compact过程"
        Before["Key1:V1, Key2:V1, Key1:V2, Key3:V1, Key2:V2"]
        After["Key1:V2, Key2:V2, Key3:V1"]
        Before -->|压缩| After
    end
```

---

## 8. 高可用与副本机制

### 8.1 副本架构

```mermaid
graph TB
    subgraph "Topic: orders, 副本因子=3"
        subgraph "Partition 0"
            P0L["Broker1<br/>Leader"]
            P0F1["Broker2<br/>Follower"]
            P0F2["Broker3<br/>Follower"]
            
            P0L --> P0F1
            P0L --> P0F2
        end
        
        subgraph "Partition 1"
            P1L["Broker2<br/>Leader"]
            P1F1["Broker3<br/>Follower"]
            P1F2["Broker1<br/>Follower"]
        end
    end
    
    Producer --> P0L
    Producer --> P1L
    
    style P0L fill:#90EE90
    style P1L fill:#90EE90
```

### 8.2 ISR 机制

```mermaid
stateDiagram-v2
    [*] --> ISR: Follower启动同步
    
    ISR --> OSR: 落后超过replica.lag.time.max.ms
    OSR --> ISR: 追上Leader
    
    note right of ISR
        ISR (In-Sync Replicas)
        - 与Leader同步的副本集合
        - 包括Leader自身
        - 只有ISR成员可被选为Leader
    end note
    
    note right of OSR
        OSR (Out-of-Sync Replicas)
        - 同步落后的副本
        - 不参与Leader选举
        - 不影响消息确认
    end note
```

### 8.3 HW 与 LEO

```mermaid
graph TB
    subgraph "Leader"
        L1[Msg0]
        L2[Msg1]
        L3[Msg2]
        L4[Msg3]
        L5[Msg4]
        L_LEO["LEO=5"]
        L_HW["HW=3"]
    end
    
    subgraph "Follower1"
        F1_1[Msg0]
        F1_2[Msg1]
        F1_3[Msg2]
        F1_LEO["LEO=3"]
    end
    
    subgraph "Follower2"
        F2_1[Msg0]
        F2_2[Msg1]
        F2_3[Msg2]
        F2_4[Msg3]
        F2_LEO["LEO=4"]
    end
    
    Note1["HW = min(所有ISR的LEO) = 3"]
    Note2["Consumer只能消费到HW位置"]
```

**概念解释：**
- **LEO (Log End Offset)**：日志末端偏移量，下一条待写入消息的位置
- **HW (High Watermark)**：高水位，Consumer可见的最大偏移量
- **HW = min(所有ISR副本的LEO)**

### 8.4 Leader Epoch

```mermaid
sequenceDiagram
    participant L1 as 原Leader
    participant F as Follower
    participant L2 as 新Leader
    
    Note over L1,F: Epoch=0
    L1->>F: 消息 offset=100
    L1->>L1: 崩溃!
    
    Note over F,L2: Epoch=1, Follower成为新Leader
    F->>L2: 变为新Leader
    L2->>L2: 记录(Epoch=1, StartOffset=101)
    
    Note over L1,L2: 原Leader恢复
    L1->>L2: 请求LeaderEpoch
    L2-->>L1: Epoch=1从101开始
    L1->>L1: 截断到offset=100
    L1->>L2: 开始同步
```

**Leader Epoch 作用：**
解决由于日志截断导致的数据不一致问题，替代原来基于HW的方式。

### 8.5 Controller 角色

```mermaid
graph TB
    subgraph "Controller职责"
        A[Broker上下线管理]
        B[Topic创建删除]
        C[Partition Leader选举]
        D[副本分配]
        E[元数据管理]
    end
    
    subgraph "Controller选举"
        F[所有Broker竞争]
        G[ZK创建临时节点]
        H[成功者成为Controller]
        I[失败者Watch节点]
    end
    
    F --> G --> H
    G --> I
    
    subgraph "故障转移"
        J[Controller宕机]
        K[ZK节点消失]
        L[其他Broker收到通知]
        M[重新竞争Controller]
    end
    
    J --> K --> L --> M
```

---

## 9. ZooKeeper/KRaft 的作用

### 9.1 ZooKeeper 在 Kafka 中的作用

```mermaid
graph TB
    subgraph "ZooKeeper存储的元数据"
        A["/brokers/ids<br/>Broker注册信息"]
        B["/brokers/topics<br/>Topic配置"]
        C["/controller<br/>Controller选举"]
        D["/admin/delete_topics<br/>待删除Topic"]
        E["/config<br/>动态配置"]
    end
    
    subgraph "核心功能"
        F[Broker发现与注册]
        G[Controller选举]
        H[Topic配置管理]
        I[ACL权限存储]
    end
    
    A --> F
    C --> G
    B --> H
    E --> I
```

### 9.2 KRaft 模式 (Kafka 3.x+)

```mermaid
graph TB
    subgraph "KRaft架构"
        subgraph "Controller Quorum"
            C1[Controller 1<br/>Active]
            C2[Controller 2<br/>Standby]
            C3[Controller 3<br/>Standby]
        end
        
        subgraph "Broker层"
            B1[Broker 1]
            B2[Broker 2]
            B3[Broker 3]
        end
        
        C1 --> B1
        C1 --> B2
        C1 --> B3
        
        C1 <--> C2
        C1 <--> C3
        C2 <--> C3
    end
    
    subgraph "优势"
        A1[移除ZK依赖]
        A2[简化部署运维]
        A3[更快的元数据传播]
        A4[更大的分区规模支持]
    end
```

**ZooKeeper vs KRaft 对比：**

| 方面           | ZooKeeper模式  | KRaft模式                     |
| -------------- | -------------- | ----------------------------- |
| 依赖           | 需要独立ZK集群 | 无外部依赖                    |
| 运维复杂度     | 高             | 低                            |
| 元数据存储     | ZK             | 内部Topic(__cluster_metadata) |
| 分区上限       | ~20万          | 数百万                        |
| Controller切换 | 较慢           | 更快                          |

---

## 10. 消息可靠性保障

### 10.1 端到端可靠性

```mermaid
flowchart LR
    subgraph "生产端可靠性"
        P1["acks=all"]
        P2["retries=MAX"]
        P3["enable.idempotence=true"]
        P4["max.in.flight.requests=1 或 5"]
    end
    
    subgraph "Broker端可靠性"
        B1["replication.factor≥3"]
        B2["min.insync.replicas≥2"]
        B3["unclean.leader.election.enable=false"]
    end
    
    subgraph "消费端可靠性"
        C1["enable.auto.commit=false"]
        C2["手动提交offset"]
        C3["处理完成后再提交"]
    end
    
    P1 & P2 & P3 & P4 --> B1 & B2 & B3 --> C1 & C2 & C3
```

### 10.2 消息丢失场景分析

```mermaid
graph TB
    subgraph "生产者丢失"
        PA1["acks=0: 发送即忘"]
        PA2["acks=1: Leader崩溃"]
        PA3["网络异常未重试"]
    end
    
    subgraph "Broker丢失"
        BA1["单副本,Broker宕机"]
        BA2["ISR全部落后时Leader切换"]
        BA3["unclean选举"]
    end
    
    subgraph "消费者丢失"
        CA1["自动提交后处理失败"]
        CA2["先提交后消费"]
    end
    
    subgraph "解决方案"
        S1["acks=all + min.insync.replicas"]
        S2["replication.factor≥3"]
        S3["手动提交 + 幂等消费"]
    end
    
    PA1 & PA2 -.-> S1
    BA1 & BA2 -.-> S2
    CA1 & CA2 -.-> S3
```

### 10.3 消息重复场景

```mermaid
graph TB
    subgraph "重复产生"
        D1["生产者重试导致"]
        D2["Rebalance后重复消费"]
        D3["消费失败后重试"]
    end
    
    subgraph "解决方案"
        S1["Producer幂等性<br/>enable.idempotence=true"]
        S2["业务幂等设计<br/>唯一ID+去重表"]
        S3["Exactly-Once语义<br/>事务Producer+Consumer"]
    end
```

### 10.4 消息顺序保证

```mermaid
graph TB
    subgraph "顺序保证级别"
        O1["分区内有序 ✓"]
        O2["全局有序 ✗ (单分区可实现)"]
    end
    
    subgraph "实现分区内有序"
        S1["相同Key到相同分区"]
        S2["max.in.flight.requests=1"]
        S3["或开启幂等性(可设为5)"]
    end
    
    subgraph "全局有序方案"
        G1["单分区(损失吞吐)"]
        G2["业务层排序"]
        G3["使用消息时间戳"]
    end
```

---

## 11. 性能优化原理

### 11.1 高性能设计

```mermaid
mindmap
  root((Kafka高性能))
    顺序IO
      磁盘顺序写
      Append-Only日志
      预读/后写优化
    零拷贝
      sendfile系统调用
      避免用户态内核态切换
      减少数据复制
    批量处理
      Producer批量发送
      Consumer批量拉取
      Broker批量写入
    压缩
      端到端压缩
      批量压缩效率高
      多种算法选择
    分区并行
      多分区并行读写
      Consumer并行消费
    PageCache
      利用操作系统缓存
      读写都受益
```

### 11.2 顺序 IO 优化

```mermaid
graph LR
    subgraph "随机IO"
        R1[寻道时间长]
        R2[磁头频繁移动]
        R3[~100 IOPS]
    end
    
    subgraph "顺序IO"
        S1[连续数据块]
        S2[预读取优化]
        S3[~10万+ IOPS]
    end
    
    R1 --> |"Kafka优化"| S1
    
    subgraph "Kafka实现"
        K1[Append-Only写入]
        K2[Segment文件连续]
        K3[索引稀疏存储]
    end
```

### 11.3 零拷贝原理

```mermaid
graph TB
    subgraph "传统拷贝 (4次)"
        T1["磁盘 → 内核缓冲区"]
        T2["内核缓冲区 → 用户空间"]
        T3["用户空间 → Socket缓冲区"]
        T4["Socket缓冲区 → 网卡"]
        T1 --> T2 --> T3 --> T4
    end
    
    subgraph "零拷贝 sendfile (2次)"
        Z1["磁盘 → 内核缓冲区"]
        Z2["内核缓冲区 → 网卡"]
        Z1 --> Z2
        Z3["(DMA直接传输)"]
    end
    
    style Z1 fill:#90EE90
    style Z2 fill:#90EE90
```

### 11.4 批量与压缩

```mermaid
graph LR
    subgraph "Producer批量"
        P1[单条消息]
        P2[累积到batch.size]
        P3[或等待linger.ms]
        P4[批量发送]
        P1 --> P2 --> P4
        P1 --> P3 --> P4
    end
    
    subgraph "压缩效果"
        C1["消息1"]
        C2["消息2"]
        C3["消息N"]
        C4["压缩批次"]
        C1 & C2 & C3 --> C4
        C5["压缩比: 2~10倍"]
    end
```

**压缩算法对比：**

| 算法   | 压缩比 | 压缩速度 | 解压速度 | CPU消耗 |
| ------ | ------ | -------- | -------- | ------- |
| none   | 1      | -        | -        | 无      |
| gzip   | 高     | 慢       | 中       | 高      |
| snappy | 中     | 快       | 快       | 低      |
| lz4    | 中     | 很快     | 很快     | 低      |
| zstd   | 很高   | 中       | 快       | 中      |

---

## 12. 实战配置与调优

### 12.1 核心配置全景

```mermaid
graph TB
    subgraph "Broker配置"
        B1["num.partitions=3"]
        B2["default.replication.factor=3"]
        B3["min.insync.replicas=2"]
        B4["log.retention.hours=168"]
        B5["log.segment.bytes=1GB"]
        B6["num.io.threads=8"]
        B7["num.network.threads=3"]
    end
    
    subgraph "Producer配置"
        P1["acks=all"]
        P2["batch.size=16384"]
        P3["linger.ms=5"]
        P4["buffer.memory=33554432"]
        P5["compression.type=lz4"]
        P6["retries=2147483647"]
    end
    
    subgraph "Consumer配置"
        C1["enable.auto.commit=false"]
        C2["max.poll.records=500"]
        C3["fetch.min.bytes=1"]
        C4["fetch.max.wait.ms=500"]
        C5["session.timeout.ms=45000"]
        C6["heartbeat.interval.ms=15000"]
    end
```

### 12.2 生产环境配置示例

```properties
# ============ Broker 核心配置 ============
# Broker唯一标识
broker.id=0

# 监听地址
listeners=PLAINTEXT://0.0.0.0:9092
advertised.listeners=PLAINTEXT://kafka-broker-1:9092

# 日志目录
log.dirs=/data/kafka-logs

# ZooKeeper/KRaft配置
zookeeper.connect=zk1:2181,zk2:2181,zk3:2181/kafka
# 或 KRaft模式
# process.roles=broker,controller
# controller.quorum.voters=1@host1:9093,2@host2:9093,3@host3:9093

# 分区与副本
num.partitions=6
default.replication.factor=3
min.insync.replicas=2

# 日志保留
log.retention.hours=168
log.retention.bytes=-1
log.segment.bytes=1073741824

# 线程配置
num.network.threads=8
num.io.threads=16

# ============ Producer 配置 ============
# 可靠性
acks=all
retries=2147483647
enable.idempotence=true

# 性能
batch.size=65536
linger.ms=10
buffer.memory=67108864
compression.type=lz4

# 超时
request.timeout.ms=30000
delivery.timeout.ms=120000

# ============ Consumer 配置 ============
# 消费组
group.id=my-consumer-group

# Offset管理
enable.auto.commit=false
auto.offset.reset=earliest

# 拉取配置
max.poll.records=500
fetch.min.bytes=1
fetch.max.bytes=52428800
fetch.max.wait.ms=500

# 会话管理
session.timeout.ms=45000
heartbeat.interval.ms=15000
max.poll.interval.ms=300000

# 分区分配
partition.assignment.strategy=org.apache.kafka.clients.consumer.CooperativeStickyAssignor
```

### 12.3 调优决策树

```mermaid
flowchart TB
    Start[性能问题] --> Q1{吞吐量不足?}
    
    Q1 -->|是| A1[增加分区数]
    Q1 -->|是| A2[调大batch.size]
    Q1 -->|是| A3[增加linger.ms]
    Q1 -->|是| A4[启用压缩]
    Q1 -->|是| A5[增加Consumer数]
    
    Q1 -->|否| Q2{延迟过高?}
    
    Q2 -->|是| B1[减小batch.size]
    Q2 -->|是| B2[减小linger.ms=0]
    Q2 -->|是| B3[减少压缩]
    Q2 -->|是| B4[增加网络线程]
    
    Q2 -->|否| Q3{消息丢失?}
    
    Q3 -->|是| C1[acks=all]
    Q3 -->|是| C2[min.insync.replicas≥2]
    Q3 -->|是| C3[关闭unclean选举]
    Q3 -->|是| C4[手动提交offset]
    
    Q3 -->|否| Q4{Rebalance频繁?}
    
    Q4 -->|是| D1[增大session.timeout.ms]
    Q4 -->|是| D2[增大max.poll.interval.ms]
    Q4 -->|是| D3[使用静态成员ID]
    Q4 -->|是| D4[用CooperativeSticky策略]
```

### 12.4 监控指标

```mermaid
graph TB
    subgraph "Broker监控"
        B1["UnderReplicatedPartitions<br/>副本不足分区数"]
        B2["ActiveControllerCount<br/>Controller状态"]
        B3["OfflinePartitionsCount<br/>离线分区"]
        B4["RequestsPerSec<br/>请求QPS"]
        B5["BytesInPerSec/BytesOutPerSec<br/>网络吞吐"]
    end
    
    subgraph "Producer监控"
        P1["record-send-rate<br/>发送速率"]
        P2["record-error-rate<br/>错误率"]
        P3["request-latency-avg<br/>请求延迟"]
        P4["batch-size-avg<br/>批次大小"]
    end
    
    subgraph "Consumer监控"
        C1["records-lag<br/>消费延迟"]
        C2["records-consumed-rate<br/>消费速率"]
        C3["commit-rate<br/>提交速率"]
        C4["rebalance-rate<br/>Rebalance频率"]
    end
```

---

## 总结

### 核心要点回顾

```mermaid
mindmap
  root((Kafka核心))
    架构
      分布式设计
      Broker集群
      分区机制
      副本容灾
    存储
      顺序写入
      日志分段
      稀疏索引
      压缩清理
    生产者
      批量发送
      分区路由
      ACK机制
      幂等事务
    消费者
      消费者组
      分区分配
      Offset管理
      Rebalance
    可靠性
      副本同步
      ISR机制
      HW/LEO
      Leader选举
    性能
      零拷贝
      PageCache
      批量压缩
      并行处理
```

### 学习路径建议

1. **入门阶段**：理解核心概念，搭建单机环境，完成基本收发消息
2. **进阶阶段**：深入理解存储机制、副本机制、消费者组原理
3. **高级阶段**：掌握性能调优、生产问题排查、Kafka Streams/Connect
4. **专家阶段**：源码分析、定制开发、架构设计


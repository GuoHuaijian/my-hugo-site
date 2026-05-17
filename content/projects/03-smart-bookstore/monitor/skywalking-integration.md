# SkyWalking 集成

## 概述

SkyWalking 是一个开源的应用性能监控（APM）系统，专为微服务、云原生和容器化架构设计。

## 集成方式

### 1. Java Agent 接入（推荐）

```bash
# 下载 SkyWalking Agent
wget https://archive.apache.org/dist/skywalking/9.5.0/apache-skywalking-java-agent-9.5.0.tgz
tar -xzf apache-skywalking-java-agent-9.5.0.tgz

# JVM 启动参数
-javaagent:/path/to/skywalking-agent/skywalking-agent.jar
-Dskywalking.agent.service_name=bookstore-seckill
-Dskywalking.collector.backend_service=localhost:11800
```

### 2. Docker 部署

```yaml
# docker-compose.yml
skywalking-oap:
  image: apache/skywalking-oap-server:9.5.0
  ports:
    - "11800:11800"  # gRPC
    - "12800:12800"  # HTTP
  environment:
    - SW_STORAGE=elasticsearch
    - SW_STORAGE_ES_CLUSTER_NODES=elasticsearch:9200

skywalking-ui:
  image: apache/skywalking-ui:9.5.0
  ports:
    - "8080:8080"
  environment:
    - SW_OAP_ADDRESS=skywalking-oap:12800
```

### 3. 客户端配置

```yaml
# 每个服务都需要配置
skywalking:
  agent:
    service_name: ${spring.application.name}
    instance_name: ${spring.cloud.client.ip-address}:${server.port}
  collector:
    backend_service: localhost:11800
```

## 核心功能

### 分布式追踪

```
[Gateway] ──► [Seckill] ──► [RocketMQ] ──► [Order] ──► [Inventory]
    │            │                          │            │
    ▼            ▼                          ▼            ▼
 TraceId:  TraceId:                  TraceId:     TraceId:
 T123      T123                      T123         T123
```

- 自动采集跨服务调用链路
- 每个 Span 记录开始时间、结束时间、状态
- 支持异步线程和消息队列追踪

### 服务拓扑图

自动生成服务间的依赖关系拓扑，直观展示：
- 服务间调用关系
- 调用量统计
- 响应时间分布
- 健康状态

### 性能分析

- **慢查询分析**：自动检测慢 SQL 语句
- **端点分析**：每个接口的吞吐量、延迟、错误率
- **服务分析**：服务级别的 SLA、CPM、响应时间

## 告警规则

```yaml
# skywalking/config/alarm-settings.yml
rules:
  # 服务响应时间告警
  - rule-name: service_resp_time_rule
    metrics-name: service_resp_time
    op: ">"
    threshold: 2000
    period: 10
    count: 3
    message: "服务 {name} 在最近 10 分钟内有 3 次响应时间超过 2 秒"

  # 服务成功率告警
  - rule-name: service_sla_rule
    metrics-name: service_sla
    op: "<"
    threshold: 8000
    period: 10
    count: 2
    message: "服务 {name} 的成功率在过去 10 分钟内低于 80%"
```

## 集成验证

```bash
# 1. 访问业务接口
curl http://localhost:8000/api/v1/seckill/1

# 2. 查看 SkyWalking UI
open http://localhost:8080

# 3. 检查链路
# 进入 "Trace" 页面，按时间搜索
# 可以看到完整的调用链路和耗时

# 4. 查看拓扑
# 进入 "Topology" 页面
# 自动生成服务依赖图
```

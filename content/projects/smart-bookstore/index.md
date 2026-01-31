---
title: "📚 BookStore 智慧书城"
description: "企业级分布式秒杀系统学习案例"
date: 2024-01-01
showTableOfContents: true
weight: 1
---

> 以"商品秒杀下单"为唯一业务主线，完整串联 12+ 项分布式核心技术。

> 目前项目正在紧急开发中

## 🎯 项目定位

这是一个专为**系统性学习分布式技术**和**面试深度讲解**设计的企业级案例。

通过一次秒杀下单的完整链路，你将掌握：

| 技术领域 | 涵盖技术 |
|---------|---------|
| 微服务架构 | Spring Cloud Alibaba、Nacos、Gateway、Dubbo |
| 高并发处理 | Redis预减库存、Lua脚本、分布式锁、异步削峰 |
| 数据一致性 | Seata分布式事务、消息最终一致性、幂等设计 |
| 分库分表 | ShardingSphere-JDBC、分片策略、绑定表 |
| 流量治理 | Sentinel限流、熔断降级、热点参数限流 |
| 可观测性 | SkyWalking链路追踪、Prometheus监控、Grafana可视化 |

## 📖 文档导航

### 🏗️ 架构设计
- [🏗️ 系统架构设计](./architecture/system-architecture) - 整体架构、服务划分、技术选型
- [🛠️ 技术栈详解](./architecture/tech-stack) - 各技术组件版本、作用、配置
- [💾 数据库设计](./architecture/database-design) - 表结构、分片策略、索引设计

### 🔄 业务流程
- [🔄 秒杀全流程详解](./flow/seckill-flow) - 从用户点击到订单完成的完整链路
- [📋 订单流程详解](./flow/order-flow) - 订单创建、支付、取消的状态流转
- [🔄 数据流转图](./flow/data-flow) - 请求在各服务间的流转过程

### 🔧 分布式技术专题
- [🔐 分布式锁详解](./distributed/distributed-lock) - Redisson实现、应用场景、最佳实践
- [🔄 分布式事务详解](./distributed/distributed-transaction) - Seata AT模式原理与实战
- [📊 分库分表详解](./distributed/sharding) - ShardingSphere配置、分片算法、绑定表
- [📨 消息队列详解](./distributed/message-queue) - RocketMQ异步削峰、可靠投递、幂等消费
- [⚡ 限流降级详解](./distributed/rate-limiting) - Sentinel规则配置、降级策略
- [👁️ 可观测性详解](./distributed/observability) - 链路追踪、日志规范、监控体系

### 📊 监控系统
- [📈 监控概览](./monitor/overview) - 监控系统架构与功能介绍
- [📊 指标采集](./monitor/metrics-collection) - 指标类型与采集配置
- [🚨 告警系统](./monitor/alert-system) - 告警规则与通知配置
- [📺 可视化](./monitor/visualization) - 监控面板与图表配置
- [🔍 SkyWalking](./monitor/skywalking-integration) - 链路追踪集成
- [🚀 部署运维](./monitor/deployment) - 监控系统部署指南
- [🔧 故障排查](./monitor/troubleshooting) - 常见问题与解决方案

### 💼 面试准备
- [💼 面试讲解指南](./interview/interview-guide) - 5分钟讲清项目的结构化方法
- [❓ 高频面试题](./interview/common-questions) - 50+道技术问题及参考答案
- [🎯 深度追问应对](./interview/deep-dive) - 面试官追问套路与应对策略

### 🚀 部署运维
- [🚀 快速开始](./deployment/quick-start) - 10分钟本地运行项目
- [🐳 Docker部署](./deployment/docker-deploy) - 一键启动完整环境
- [🔍 问题排查](./deployment/troubleshooting) - 常见问题与解决方案

## 🏛️ 系统架构
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 用户请求 │
└─────────────────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Spring Cloud Gateway │
│ (路由 · JWT认证 · 限流 · 黑名单) │
└─────────────────────────────────────────────────────────────────────────────┘
│
┌──────────────────────────┼──────────────────────────┐
▼ ▼ ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 秒杀服务 │◄──Dubbo──►│ 订单服务 │◄──Dubbo──►│ 库存服务 │
│ (核心入口) │ │ (分库分表) │ │ (分库分表) │
└─────────────┘ └─────────────┘ └─────────────┘
│ │ │
└──────────────────────────┼──────────────────────────┘
▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 中间件层 │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ Nacos │ │ Redis │ │RocketMQ │ │ Seata │ │Sentinel │ │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 数据层 │
│ MySQL (用户库 · 商品库 · 订单库×2 · 库存库×2) │
│ ShardingSphere 分库分表 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🛠️ 技术栈

| 层次 | 技术 | 版本 | 说明 |
|-----|------|------|-----|
| 基础框架 | Spring Boot | 2.7.18 | 应用开发框架 |
| 微服务 | Spring Cloud Alibaba | 2021.0.5.0 | 微服务全家桶 |
| 注册/配置 | Nacos | 2.2.3 | 服务发现与配置中心 |
| 服务调用 | Dubbo | 3.2.0 | 高性能RPC框架 |
| 网关 | Spring Cloud Gateway | 3.1.x | API网关 |
| 限流熔断 | Sentinel | 1.8.6 | 流量治理 |
| 分布式事务 | Seata | 1.7.0 | AT模式分布式事务 |
| 分库分表 | ShardingSphere-JDBC | 5.4.1 | 数据分片 |
| 消息队列 | RocketMQ | 5.1.0 | 异步消息 |
| 缓存 | Redis + Redisson | 7.0 / 3.23.0 | 缓存与分布式锁 |
| 链路追踪 | SkyWalking | 9.5.0 | APM监控 |
| 数据库 | MySQL | 8.0 | 关系数据库 |
| 缓存 | Redis + Redisson | 7.0 / 3.23.0 | 缓存与分布式锁 |
| 监控 | Prometheus + Grafana | 2.40 / 9.5.0 | 指标采集与可视化 |
| 链路追踪 | SkyWalking | 9.5.0 | APM监控 |
| 前端 | Vue 3 + Element Plus | 3.3 / 2.3 | 前端框架 |

## 📂 项目结构
```
bookstore-smart/
├── bookstore-gateway/          # API网关
├── bookstore-auth/             # 认证服务
├── bookstore-service/
│   ├── bookstore-user-service/  # 用户服务
│   ├── bookstore-product-service/  # 商品服务
│   ├── bookstore-inventory-service/  # 库存服务（分库分表）
│   ├── bookstore-order-service/      # 订单服务（分库分表）
│   └── bookstore-seckill-service/   # 秒杀服务（核心）
├── bookstore-common/           # 公共模块
├── bookstore-api/             # Dubbo接口定义
├── bookstore-admin/           # 管理后台
├── bookstore-ui/             # 前端项目
├── bookstore-monitor/         # 监控系统
├── docs/                     # 项目文档
└── deploy/                   # 部署配置
```

## 🚀 快速开始

### 环境要求
- JDK 17+
- Maven 3.8+
- Docker & Docker Compose
- Node.js 18+

### 访问地址
| 服务 | 地址 | 说明 |
|------|------|------|
| 前端页面 | http://localhost:3000 | Vue前端 |
| API网关 | http://localhost:8000 | 统一入口 |
| Nacos控制台 | http://localhost:8848/nacos | nacos/nacos |
| Sentinel控制台 | http://localhost:8858 | sentinel/sentinel |
| SkyWalking | http://localhost:8080 | 链路追踪 |
| RocketMQ控制台 | http://localhost:19876 | 消息监控 |

### 测试账号
| 用户名 | 密码 | 说明 |
|--------|------|------|
| user1 | 123456 | 普通用户 |
| user2 | 123456 | 普通用户 |
| admin | 123456 | 管理员 |


### 📊 核心流程概览

秒杀下单完整链路（12个技术点）

```
[用户点击]
    │
    ▼
[1.Gateway限流] ──Sentinel网关限流──► 超限直接返回
    │
    ▼
[2.JWT认证] ──Token校验──► 无效返回401
    │
    ▼
[3.服务限流] ──Sentinel服务限流──► 超限降级返回
    │
    ▼
[4.校验链] ──活动/用户/重复/限购校验──► 校验失败直接返回
    │
    ▼
[5.Redis预减库存] ──Lua脚本原子操作──► 库存不足直接返回
    │
    ▼
[6.分布式锁] ──Redisson防并发──► 获取失败返回
    │
    ▼
[7.发送MQ] ──RocketMQ异步──► 返回"排队中"
    │
    ════════════════ 异步分割线 ════════════════
    ▼
[8.MQ消费] ──幂等校验──► 已消费跳过
    │
    ▼
[9.分布式事务] ──Seata AT模式──► 开启全局事务
    │
    ├──[10.创建订单] ──ShardingSphere分库分表──► 订单入库
    │
    └──[11.扣减库存] ──Dubbo调用+乐观锁──► 库存入库
    │
    ▼
[12.发送延迟消息] ──30分钟后检查超时──► 自动取消
    │
    ▼
[保存结果] ──Redis存储──► 供前端轮询
```

---

> 💡 **提示**：本目录是智慧书店项目的技术文档合集，涵盖了从架构设计到部署运维的全链路技术细节。适合开发者学习分布式技术，也适合作为面试的技术储备。

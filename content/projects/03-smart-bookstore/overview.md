# 项目概述

## 技术栈

| 层次 | 技术 | 版本 | 说明 |
|-----|------|------|------|
| 基础框架 | Spring Boot | 2.7.18 | 应用开发框架 |
| 微服务 | Spring Cloud Alibaba | 2021.0.5.0 | 微服务全家桶 |
| 注册/配置 | Nacos | 2.2.3 | 服务发现与配置中心 |
| 服务调用 | Dubbo | 3.2.0 | 高性能 RPC 框架 |
| 网关 | Spring Cloud Gateway | 3.1.x | API 网关 |
| 限流熔断 | Sentinel | 1.8.6 | 流量治理 |
| 分布式事务 | Seata | 1.7.0 | AT 模式 |
| 分库分表 | ShardingSphere-JDBC | 5.4.1 | 数据分片 |
| 消息队列 | RocketMQ | 5.1.0 | 异步消息 |
| 缓存/锁 | Redis + Redisson | 7.0 / 3.23.0 | 缓存与分布式锁 |
| 链路追踪 | SkyWalking | 9.5.0 | APM 监控 |
| 数据库 | MySQL | 8.0 | 关系数据库 |
| 监控 | Prometheus + Grafana | 2.40 / 9.5.0 | 指标采集与可视化 |
| 前端 | Vue 3 + Element Plus | 3.3 / 2.3 | 前端框架 |

## 项目结构

```
bookstore-smart/
├── bookstore-gateway/                  # API网关
├── bookstore-auth/                     # 认证服务
├── bookstore-service/
│   ├── bookstore-user-service/         # 用户服务
│   ├── bookstore-product-service/      # 商品服务
│   ├── bookstore-inventory-service/    # 库存服务（分库分表）
│   ├── bookstore-order-service/        # 订单服务（分库分表）
│   └── bookstore-seckill-service/      # 秒杀服务（核心）
├── bookstore-common/                   # 公共模块
├── bookstore-api/                      # Dubbo接口定义
├── bookstore-admin/                    # 管理后台
├── bookstore-ui/                       # 前端项目
├── bookstore-monitor/                  # 监控系统
├── docs/                               # 项目文档
└── deploy/                             # 部署配置
```

## 服务职责划分

| 服务名 | 端口 | 职责 | 核心技术 |
|-------|------|------|---------|
| bookstore-gateway | 8000 | API 统一入口、路由、认证、限流 | Gateway、Sentinel |
| bookstore-auth | 8001 | 用户认证、Token 管理 | JWT、Redis |
| bookstore-user-service | 8010 | 用户信息管理 | MyBatis |
| bookstore-product-service | 8020 | 商品管理、秒杀活动管理 | MyBatis、Caffeine |
| bookstore-seckill-service | 8050 | **秒杀核心逻辑** | Redis、RocketMQ、Sentinel |
| bookstore-order-service | 8040 | 订单管理、状态机 | ShardingSphere、Seata |
| bookstore-inventory-service | 8030 | 库存管理、乐观锁 | ShardingSphere、Seata |
| bookstore-admin | 8060 | 管理后台 | 聚合调用 |

## 设计原则

- **单一职责**：每个服务只负责一个业务领域，秒杀服务不直接操作订单数据库
- **服务自治**：每个服务有独立数据库，服务间通过 Dubbo RPC 调用
- **接口隔离**：Dubbo 接口定义在独立 API 模块，使用 DTO 传输
- **最终一致性**：使用消息队列解耦，Seata 保证关键操作的强一致性

## 技术选型理由

- **Dubbo 而非 Feign**：基于 TCP 长连接性能更好，有丰富的负载均衡策略
- **Seata AT 模式**：低侵入，只需一个注解，自动补偿机制
- **RocketMQ**：支持事务消息和延迟消息，主从架构高可靠
- **ShardingSphere-JDBC**：客户端分片，业务代码透明，无需额外部署

---
name: "BookStore 智慧书城"
description: "企业级分布式秒杀系统学习案例，以商品秒杀下单为唯一业务主线，完整串联 12+ 项分布式核心技术。"
tags: ["Java", "Spring Cloud", "秒杀", "分布式"]
status: "开发中"
githubUrl: "https://github.com/GuoHuaijian"
cover: "/content/covers/smart-bookstore.png"
docs:
  - title: "项目概述"
    file: "overview.md"
  - title: "系统架构设计"
    file: "system-architecture.md"
  - title: "数据库设计"
    file: "database-design.md"
  - title: "秒杀全流程"
    file: "seckill-flow.md"
  - title: "订单流程"
    file: "order-flow.md"
  - title: "数据流转图"
    file: "flow/data-flow.md"
  - title: "分布式技术专题"
    file: "distributed-tech.md"
  - title: "监控概览"
    file: "monitor/overview.md"
  - title: "指标采集"
    file: "monitor/metrics-collection.md"
  - title: "告警系统"
    file: "monitor/alert-system.md"
  - title: "可视化面板"
    file: "monitor/visualization.md"
  - title: "SkyWalking 集成"
    file: "monitor/skywalking-integration.md"
  - title: "监控部署"
    file: "monitor/deployment.md"
  - title: "监控故障排查"
    file: "monitor/troubleshooting.md"
  - title: "部署运维"
    file: "deployment.md"
  - title: "部署问题排查"
    file: "deployment/troubleshooting.md"
  - title: "面试指南"
    file: "interview-guide.md"
  - title: "高频面试题"
    file: "interview/common-questions.md"
  - title: "深度追问应对"
    file: "interview/deep-dive.md"
---

# 📚 BookStore 智慧书城

> 以"商品秒杀下单"为唯一业务主线，完整串联 12+ 项分布式核心技术。

一个专为**系统性学习分布式技术**和**面试深度讲解**设计的企业级案例。通过一次秒杀下单的完整链路，覆盖微服务架构、高并发处理、数据一致性、分库分表、流量治理、可观测性等核心技术领域。

## 项目定位

| 技术领域 | 涵盖技术 |
|---------|---------|
| 微服务架构 | Spring Cloud Alibaba、Nacos、Gateway、Dubbo |
| 高并发处理 | Redis 预减库存、Lua 脚本、分布式锁、异步削峰 |
| 数据一致性 | Seata 分布式事务、消息最终一致性、幂等设计 |
| 分库分表 | ShardingSphere-JDBC、分片策略、绑定表 |
| 流量治理 | Sentinel 限流、熔断降级、热点参数限流 |
| 可观测性 | SkyWalking 链路追踪、Prometheus 监控、Grafana 可视化 |

## 秒杀核心流程（12 个技术点）

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

## 快速访问

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端页面 | http://localhost:3000 | Vue 前端 |
| API 网关 | http://localhost:8000 | 统一入口 |
| Nacos | http://localhost:8848/nacos | 注册配置中心 |
| Sentinel | http://localhost:8858 | 限流控制台 |
| SkyWalking | http://localhost:8080 | 链路追踪 |

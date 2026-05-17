---
title: "项目概述"
---

# Spider Nest

Spider Nest 是一个模块化 Python 爬虫框架，从单机脚本到分布式采集一键切换。

## 核心理念

- **声明式配置**：用 YAML 描述目标网站和抽取规则，而非手写请求循环
- **渐进式采集**：单机爬虫 → Redis 分布式 → 集群管理，按需演进
- **对抗思维**：内置反爬对抗工具箱，而非事后打补丁

## 适用场景

- 电商价格监控与竞品分析
- 新闻 / 社交媒体内容聚合
- 学术数据采集与结构化
- 企业数据资产沉淀

## 技术栈

| 层面 | 技术选型 |
|------|---------|
| 运行时 | Python 3.11+ |
| HTTP 客户端 | httpx + aiohttp |
| 解析引擎 | Parsel / Playwright |
| 分布式后端 | Redis / RabbitMQ |
| 数据结构化 | Pydantic |
| 存储适配 | CSV / Parquet / PostgreSQL |

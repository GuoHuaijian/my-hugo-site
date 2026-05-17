---
name: "Spider Nest"
description: "一个模块化 Python 爬虫框架，内置分布式调度、动态代理池、反爬对抗策略，支持可视化任务编排。"
tags: ["Python", "爬虫", "分布式", "数据采集"]
status: "规划中"
githubUrl: ""
cover: "/content/covers/spider-nest.png"
docs:
  - title: "项目概述"
    file: "overview.md"
  - title: "架构设计"
    file: "architecture.md"
  - title: "快速开始"
    file: "installation.md"
---

# Spider Nest

> **编织数据之网——优雅地采集、解析、清洗。**

一个模块化 Python 爬虫框架，从单机脚本到分布式采集一键切换。内置动态代理池、智能解析引擎、反爬对抗工具箱，让数据采集变得可靠且可维护。

## 设计目标

- **声明式爬虫**：定义目标 + 解析规则 = 可运行的爬虫，无需手写请求循环
- **动态代理**：自动检测、切换、验证代理 IP，降低封禁风险
- **智能解析**：基于 CSS Selector / XPath / 视觉区域的自动抽取引擎
- **数据管道**：内置清洗 → 去重 → 存储的标准数据流

## 规划特性

- 分布式调度器（Redis / RabbitMQ 两种后端）
- 浏览器自动化集成（Playwright 渲染 JS 页面）
- 反爬对抗：请求指纹随机化、Cookie 池、验证码识别接入
- 可视化仪表盘：任务进度、采集速度、失败率实时监控
- 输出适配：CSV / JSON / Parquet / 数据库直连

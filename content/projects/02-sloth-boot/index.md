---
name: "Sloth Boot"
description: "一个基于 Spring Boot 3.x + Spring Cloud Alibaba 的 Java 多模块企业级基础脚手架。沉淀高频、可复用的工程化基础能力。"
tags: ["Java", "Spring Boot", "Spring Cloud", "微服务"]
status: "实验中"
cover: "/content/covers/sloth-boot.png"
stars: 125
forks: 66
githubUrl: "https://github.com/GuoHuaijian/SlothBoot"
docs:
  - title: "项目概述"
    file: "overview.md"
  - title: "快速开始"
    file: "installation.md"
  - title: "架构设计"
    file: "architecture.md"
  - title: "配置参考"
    file: "configuration.md"
  - title: "迁移指南"
    file: "migration-guide.md"
  - title: "测试指南"
    file: "testing-guide.md"
  - title: "错误码表"
    file: "error-codes.md"
  - title: "常见问题"
    file: "faq.md"
---

# 🦥 Sloth Boot

> **慢工出细活。** 一个面向个人开源与中小团队的 Spring Boot 多模块基础脚手架。
> 不造平台，只沉淀高频、可复用的工程化基础能力。

Sloth Boot 基于 **Spring Boot 3.5.x + Spring Cloud 2025.0.0 + Spring Cloud Alibaba 2025.0.0.0**，提供了 **31 个模块** 的开箱即用企业级组件 —— 认证授权、统一日志、分布式锁、限流熔断、消息队列、AI 集成等。

设计哲学：**结构清晰可裁剪，配置收敛一目了然，自动装配零配置，适合长期维护和二次定制。**

## 核心特性

- **多模块分离**：`common` 基础层 + `starter` 能力层 + `example` 示例工程，按需引入
- **统一配置治理**：所有自定义配置统一 `sloth.*` 前缀，IDE 自动补全
- **自动装配**：`@ConditionalOnMissingBean` 支持业务侧覆盖，零配置接入
- **覆盖高频场景**：Web / Redis / MQ / MyBatis / 线程池 / 网关 / AI / OSS / Excel / 短信 / ES 等
- **测试友好**：提供 Spring Boot / MockMvc / Mapper 测试基类，集成 CI/CD
- **微服务就绪**：Nacos + Sentinel + Seata + Gateway + Feign 全链路集成

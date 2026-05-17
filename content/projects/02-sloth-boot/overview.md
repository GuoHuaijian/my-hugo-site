# 项目概述

## 为什么叫 Sloth Boot？

树懒不慌不忙，但每一步都踩得很稳。
这个项目的理念相同 —— **不追求大而全，只做扎实可用的基础层**：

- 结构清晰，可以按模块裁剪引入
- 配置收敛，统一 `sloth.*` 前缀，一目了然
- 自动装配，业务侧接入几乎零配置
- 适合长期维护，而不是一次性造轮子
- 代码可读，注释友好，适合学习和二次定制

## 技术栈

| 层次 | 技术选型 |
|------|---------|
| **语言 & 运行时** | Java 21 · Maven 3.8.1+ |
| **核心框架** | Spring Boot 3.5.0 · Spring Cloud 2025.0.0 |
| **微服务生态** | Spring Cloud Alibaba 2025.0.0.0 · Nacos · Sentinel · Seata |
| **AI 能力** | Spring AI 1.1.4 · OpenAI · 通义千问 · DeepSeek · Ollama |
| **数据层** | MyBatis-Plus · MySQL · Elasticsearch |
| **缓存 & 消息** | Redis · RocketMQ |
| **任务 & 文件** | XXL-Job · MinIO · 阿里云 OSS |
| **网关 & RPC** | Spring Cloud Gateway · OpenFeign |
| **文档 & 监控** | Knife4j · Spring Actuator · Prometheus |

## 模块结构

```
sloth-boot/
│
├── 📦 sloth-boot-common/            # 基础公共层
│   ├── sloth-boot-common-core       # 常量 / 异常 / 返回体 / 上下文 / 工具类 / 注解
│   ├── sloth-boot-common-log        # Trace 过滤 / 请求日志 / 操作日志切面
│   ├── sloth-boot-common-security   # 加解密 / 签名 / 脱敏 / XSS 处理
│   ├── sloth-boot-common-doc        # OpenAPI / Knife4j 文档自动配置
│   └── sloth-boot-common-test       # 测试基类
│
├── 🚀 sloth-boot-starter/           # 能力 Starter 层
│   ├── sloth-boot-starter-web       # Web 基础 / 统一异常 / 统一返回 / 参数校验
│   ├── sloth-boot-starter-ai        # Spring AI 集成 / ChatClient 封装
│   ├── sloth-boot-starter-redis     # RedisTemplate / 缓存工具 / 分布式锁 / 限流
│   ├── sloth-boot-starter-mq        # RocketMQ 生产消费封装
│   ├── sloth-boot-starter-mybatis   # MyBatis-Plus 插件 / 自动填充 / TypeHandler
│   ├── sloth-boot-starter-thread-pool  # 线程池 / 上下文透传 / 监控端点
│   ├── sloth-boot-starter-sentinel  # Sentinel 限流降级 / Nacos 规则源
│   ├── sloth-boot-starter-monitor   # 健康检查 / 告警 / Actuator 增强
│   ├── sloth-boot-starter-feign     # Feign 拦截器 / 解码器 / Fallback 模板
│   ├── sloth-boot-starter-gateway   # Gateway 过滤器 / 异常处理 / 动态路由
│   ├── sloth-boot-starter-oss       # 本地 / MinIO / 阿里云 OSS 统一封装
│   ├── sloth-boot-starter-excel     # Excel 导入导出与响应封装
│   ├── sloth-boot-starter-job       # XXL-Job 自动配置与任务基类
│   ├── sloth-boot-starter-seata     # Seata AT 模式自动配置
│   ├── sloth-boot-starter-es        # Elasticsearch 常用操作封装
│   ├── sloth-boot-starter-sms       # 阿里云 / 腾讯云短信门面
│   └── sloth-boot-starter-idempotent  # 幂等增强 / Token 模式
│
├── 🧪 sloth-boot-example/           # 示例工程
│   └── sloth-boot-example-service   # 单体服务示例，本地可直接运行
│
├── sloth-boot-generator/            # MyBatis-Plus 代码生成器
├── sloth-boot-dependencies/         # BOM 版本集中管理
└── sloth-boot-parent/              # 共享父 POM
```

## Roadmap

```
Phase 1 — 骨架搭建               ████████████████████  100% ✅
Phase 2 — 代码质量与测试          ████████████████████  100% ✅
Phase 3 — 核心能力建设            ████████████████████  100% ✅
Phase 4 — 现代化特性              ████████████████████  100% ✅
Phase 5 — 开源运营与发布          ██████████████░░░░░░   70% 📋
```

进度：
- 完成 31 个模块骨架搭建与编译修复
- 53 个单元测试覆盖核心模块
- AI 流式响应、虚拟线程、GraalVM Native Image 支持
- i18n 国际化 + 配置元数据（IDE 自动补全）
- Docker 支持（Dockerfile + docker-compose.yml）
- ⬜ Maven Central 发布
- ⬜ 在线文档站（VitePress）

## 设计原则

- **common-core 是最底层**，不依赖任何 starter
- **common-\* 之间不相互依赖**
- **starter-\* 只依赖 common-core**（及需要的 common 子模块），不依赖其他 starter
- **example 按需引入 starter**，演示集成效果

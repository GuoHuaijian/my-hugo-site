---
name: "Agent Forge"
description: "一个轻量级 AI Agent 编排框架，支持多工具组合、记忆管理、思维链推理，用于构建可扩展的智能代理工作流。"
tags: ["Python", "AI", "Agent", "LLM", "工作流"]
status: "规划中"
githubUrl: ""
cover: "/content/covers/agent-forge.png"
docs:
  - title: "项目概述"
    file: "overview.md"
  - title: "架构设计"
    file: "architecture.md"
  - title: "快速开始"
    file: "installation.md"
---

# Agent Forge

> **锻造智能代理——像搭积木一样组合 AI 能力。**

一个轻量级 AI Agent 编排框架，专注于降低构建智能代理工作流的门槛。通过插件化的工具系统、灵活的记忆管理和可插拔的推理策略，让开发者能快速组合出满足业务需求的 Agent 应用。

## 设计目标

- **工具即插即用**：统一的 Tool 接口，一行代码注册新工具
- **记忆分层**：短期记忆（对话上下文）→ 长期记忆（向量存储）→ 持久化记忆（数据库）
- **推理可配置**：ReAct / Plan-and-Execute / Reflexion 多种推理策略一键切换
- **多模型兼容**：OpenAI / Anthropic / 本地模型统一抽象

## 规划特性

- 多 Agent 协作（Orchestrator + Worker 模式）
- 带人类反馈的交互式工作流（Human-in-the-Loop）
- 可观测性：Agent 调用链路追踪、Token 用量统计
- 轻量无侵入：核心库零依赖，运行时按需加载

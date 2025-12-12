---
title: "利用DeepSeek + Ollama + Dify搭建本地知识库"
date: 2025-03-22
author: "Guo"
tags: ["学习笔记", "AI"]
comments: true
toc: true
---

随着大语言模型 (LLM) 的开源化，我们有机会将 AI 的强大能力带到本地，打造一个完全掌控的知识管理系统。本文将详细指导你利用 **DeepSeek**（高性能开源 LLM）、**Ollama**（轻量模型运行工具）和 **Dify**（AI 应用开发平台），搭建一个离线的本地知识库，适用于个人笔记管理、专业文档查询或小型团队协作。无论你是技术新手还是资深玩家，这套方案都能让你轻松上手。

## 为什么选择 DeepSeek + Ollama + Dify？
- **隐私至上**：所有数据和计算都在本地运行，避免云端泄露风险，特别适合敏感信息处理。
- **性能强劲**：DeepSeek R1 是开源社区的明星模型，在数学推理、代码生成和知识检索上表现优异，甚至能与一些商业模型一较高下。
- **操作简便**：Ollama 让模型部署像运行命令一样简单，Dify 的图形界面则省去了复杂编码。
- **高度灵活**：支持从轻量级 1.5B 到高性能 70B 的多种模型，适配不同硬件和需求。

## 前置条件
开始之前，请准备：
- **硬件**：最低 8GB 内存（运行 1.5B 模型）；推荐 16GB+ 内存和 GPU（运行 7B 或更大模型）。
- **软件**：安装 Docker（Dify 依赖）、Git（克隆代码）和终端工具。
- **数据**：准备知识库内容，如 PDF 论文、TXT 笔记或 Word 文档，建议整理好结构。
- **网络**：首次下载模型和工具需要联网，之后可完全离线使用。

## 搭建步骤

### 1. 安装 Ollama 并运行 DeepSeek
Ollama 是一个专注于本地 LLM 运行的开源工具，支持多种模型，安装简单且资源占用低。

- **安装 Ollama**：
  1. 访问 [Ollama 官网](https://ollama.com/)，下载适合你系统的安装包（Windows、MacOS 或 Linux）。
  2. 安装完成后，在终端输入：
     ```bash
     ollama --version
     ```
     输出类似 `ollama version 0.1.x`，表示安装成功。  
     ![](https://raw.githubusercontent.com/GuoHuaijian/picture/main/data/20250322161406177.jpg)
  3. **小贴士**：若遇到权限问题，确保终端以管理员或 root 身份运行。

- **运行 DeepSeek 模型**：
  1. DeepSeek R1 有多个版本（如 1.5B、7B、70B），参数越大性能越强但资源需求也更高。推荐从 7B 开始：
     ```bash
     ollama run deepseek-r1:7b
     ```
     首次运行会自动下载模型（7B 约 4.7GB，视网速需几分钟到半小时）。
  2. 测试模型是否正常：
     ```bash
     ollama run deepseek-r1:7b "你好，世界！请用中文回复。"
     ```
     若返回类似“您好！有什么我可以帮助您的？”的回答，说明模型就绪。  
     ![](https://raw.githubusercontent.com/GuoHuaijian/picture/main/data/20250322161502988.jpg)  
  3. **进阶选项**：用 `ollama list` 查看已下载模型，或用 `--verbose` 参数查看运行日志。

### 2. 部署 Dify
Dify 是一个强大的开源平台，支持快速构建 AI 应用，尤其擅长知识库管理和对话系统。

- **克隆并配置**：
  1. 在终端运行：
     ```bash
     git clone https://github.com/langgenius/dify.git
     cd dify/docker
     cp .env.example .env
     ```
  2. 检查 `.env` 文件，默认设置即可运行。若需自定义：
     - 修改 `PORT`（默认 80）避免冲突。
     - 设置 `POSTGRES_PASSWORD` 增强数据库安全性。

- **启动服务**：
  1. 执行：
     ```bash
     docker compose up -d
     ```
     Docker 会拉取依赖镜像并启动服务（约 5-10 分钟，视机器性能）。
  2. 打开浏览器，访问 `http://localhost`，你将看到 Dify 的欢迎界面。
     ![](https://raw.githubusercontent.com/GuoHuaijian/picture/main/data/20250322161521725.jpg)
  3. 创建管理员账户，建议记录用户名和密码。
  4. **故障排查**：若启动失败，用 `docker compose logs` 检查错误，可能需调整 Docker 内存分配。

### 3. 集成 Ollama 与 DeepSeek
将本地 DeepSeek 模型接入 Dify，实现无缝协作。

- **添加模型**：
  1. 登录 Dify，进入 **Profile → Settings → Model Providers**。
  2. 选择 **Ollama**，点击 **Add Model**。
  3. 填写配置：
     - **Model Name**：`deepseek-r1:7b`（与 Ollama 一致）。
     - **Base URL**：`http://localhost:11434`（Ollama 默认地址）。
  4. 点击保存，Dify 会自动检测模型状态。  
     ![](https://raw.githubusercontent.com/GuoHuaijian/picture/main/data/20250322161541389.jpg)  
  5. **注意**：确保 Ollama 在后台运行，否则连接会失败。

### 4. 创建知识库
上传你的文档，构建专属知识库。

- **上传文档**：
  1. 在 Dify 主页，点击 **Knowledge** → **Create Knowledge**。
  2. 上传文件（支持 PDF、TXT、Markdown 等），建议每次不超过 50MB。
  3. 勾选 **Parent-Child Segmentation** 分段模式，确保模型理解文档层次结构。  
     ![](https://raw.githubusercontent.com/GuoHuaijian/picture/main/data/20250322161610913.jpg) 
  4. **预处理技巧**：若文档复杂（如多栏 PDF），先用工具转为纯文本再上传。

- **测试应用**：
  1. 返回主页，点击 **Create Blank App**，选择 **Chatbot** 类型。
  2. 在设置中：
     - 模型选 `deepseek-r1:7b`。
     - **Context** 中关联刚创建的知识库。
  3. 输入测试问题，如：“文档中提到的核心概念是什么？” 或 “总结第一章内容。”
     若回答准确，知识库已就位。  
     ![](https://raw.githubusercontent.com/GuoHuaijian/picture/main/data/20250322161653138.jpg)  
  4. **优化提示**：若答案不够精准，检查文档是否清晰，或调整问题表述。

### 5. 优化与使用
让知识库更智能、更实用。

- **参数调整**：
  - 在 Dify 应用设置中，调整 **Top-K**（默认 5）和 **Score Threshold**，控制召回内容数量和质量。
  - 启用 **Rerank** 模型（需额外配置），提升检索相关性。
- **功能扩展**：
  - 用 Dify 的 **Workflow** 模式设计多轮对话，或添加条件判断（如“若无答案则提示用户”）。
  - 若联网可用，可集成外部搜索增强知识库。
- **日常使用**：
  - 点击 **Publish**，生成访问链接，随时在本地浏览器使用。  
     ![](https://raw.githubusercontent.com/GuoHuaijian/picture/main/data/20250322161708389.jpg) 
  - 考虑用 Nginx 反向代理，将服务部署到内网，供团队共享。

## 实用建议
- **模型选择**：硬件有限用 1.5B（轻快但理解稍弱）；7B 是性能与资源平衡的最佳选择；70B 需高端 GPU。
- **文档优化**：上传前去除无关内容（如广告页），用标题和段落分隔提升可读性。
- **性能提升**：若运行卡顿，检查 CPU/GPU 占用，必要时升级硬件或减小模型规模。
- **数据管理**：定期备份 Ollama 模型（`~/.ollama/models`）和 Dify 数据（`dify/docker/volumes`），避免意外丢失。

## 结语
通过 DeepSeek、Ollama 和 Dify 的组合，你不仅能搭建一个高效的本地知识库，还能根据需求定制功能。从个人学习到企业知识管理，这套方案都游刃有余。动手尝试吧，让 AI 成为你的得力助手！

---
title: "Docker Compose"
---

# Docker Compose 命令

## 常用命令

```bash
# 启动所有服务
docker compose up -d

# 停止所有服务
docker compose down

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f

# 重新构建并启动
docker compose up -d --build
```

## compose.yml 示例

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## 高级用法

```bash
# 指定 compose 文件
docker compose -f docker-compose.prod.yml up -d

# 只启动特定服务
docker compose up -d web

# 扩展服务实例
docker compose up -d --scale worker=3

# 暂停/恢复服务
docker compose pause
docker compose unpause
```

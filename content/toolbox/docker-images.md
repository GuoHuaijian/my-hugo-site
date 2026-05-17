---
title: "镜像管理"
---

# Docker 镜像管理命令

## 获取镜像

```bash
# 拉取镜像
docker pull nginx:latest
docker pull node:18-alpine

# 从 Dockerfile 构建
docker build -t myapp:1.0 .

# 指定 Dockerfile 路径
docker build -f Dockerfile.prod -t myapp:prod .
```

## 查看镜像

```bash
# 列出本地镜像
docker images
docker image ls

# 查看镜像详情
docker inspect nginx:latest

# 查看镜像历史层
docker history nginx:latest
```

## 管理镜像

```bash
# 删除镜像
docker rmi nginx:latest

# 给镜像打标签
docker tag myapp:1.0 registry.example.com/myapp:1.0

# 推送镜像到仓库
docker push registry.example.com/myapp:1.0

# 清理无用镜像
docker image prune -a
```

## 导入导出

```bash
# 导出镜像为 tar
docker save nginx:latest > nginx.tar

# 从 tar 导入镜像
docker load < nginx.tar
```

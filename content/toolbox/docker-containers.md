---
title: "容器管理"
---

# Docker 容器管理命令

## 容器生命周期

```bash
# 运行容器
docker run -d --name myapp -p 8080:80 nginx

# 启动/停止/重启
docker start myapp
docker stop myapp
docker restart myapp

# 删除容器
docker rm myapp

# 强制删除运行中的容器
docker rm -f myapp
```

## 查看容器

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括已停止）
docker ps -a

# 查看容器日志
docker logs myapp

# 实时查看日志
docker logs -f myapp
```

## 进入容器

```bash
# 进入容器 shell
docker exec -it myapp /bin/bash

# 执行单条命令
docker exec myapp ls /app

# 以特定用户身份进入
docker exec -it -u root myapp /bin/bash
```

## 容器资源

```bash
# 查看资源使用
docker stats

# 查看容器详情
docker inspect myapp

# 查看容器端口映射
docker port myapp
```

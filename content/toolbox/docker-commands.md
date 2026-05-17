---
title: Docker 常用命令速查
---

## 容器管理

```bash
# 运行容器
docker run -d --name myapp -p 8080:8080 myimage

# 查看运行中的容器
docker ps
docker ps -a

# 停止 / 启动 / 重启
docker stop <container>
docker start <container>
docker restart <container>

# 删除容器
docker rm <container>
docker rm -f <container>

# 进入容器
docker exec -it <container> /bin/bash

# 查看日志
docker logs -f <container>
docker logs --tail 100 <container>
```

## 镜像管理

```bash
# 拉取镜像
docker pull <image>
docker pull mysql:8.0

# 查看镜像
docker images

# 构建镜像
docker build -t myapp:1.0 .

# 删除镜像
docker rmi <image>

# 导出 / 导入
docker save -o myapp.tar myapp:1.0
docker load -i myapp.tar
```

## Docker Compose

```bash
# 启动服务
docker compose up -d

# 停止服务
docker compose down

# 查看日志
docker compose logs -f

# 重启服务
docker compose restart

# 构建并启动
docker compose up -d --build

# 查看服务状态
docker compose ps
```

## 清理

```bash
# 删除所有停止的容器
docker container prune

# 删除未使用的镜像
docker image prune

# 清理所有未使用资源
docker system prune -a
```

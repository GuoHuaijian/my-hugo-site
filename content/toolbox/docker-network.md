---
title: "网络与存储"
---

# Docker 网络与存储命令

## 网络管理

```bash
# 列出网络
docker network ls

# 创建网络
docker network create mynet

# 查看网络详情
docker network inspect mynet

# 连接容器到网络
docker network connect mynet myapp

# 断开连接
docker network disconnect mynet myapp

# 删除网络
docker network rm mynet
```

## 数据卷管理

```bash
# 列出数据卷
docker volume ls

# 创建数据卷
docker volume create mydata

# 查看数据卷详情
docker volume inspect mydata

# 删除数据卷
docker volume rm mydata

# 清理未使用的数据卷
docker volume prune
```

## 挂载示例

```bash
# 挂载数据卷
docker run -d -v mydata:/app/data nginx

# 挂载主机目录
docker run -d -v /host/path:/container/path nginx

# 只读挂载
docker run -d -v /host/path:/container/path:ro nginx
```

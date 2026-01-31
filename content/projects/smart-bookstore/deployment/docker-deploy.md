---
title: "Docker部署"
description: "智慧书店项目技术文档 - Docker部署"
date: 2024-01-01
weight: 17
difficulty: 2
readTime: 30
keywords: ['Docker', '部署', '容器化', '环境']
---

# Docker部署

> 一键启动完整BookStore智慧书城环境

## 📋 部署架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Compose 集群                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Nacos     │  │   MySQL     │  │   Redis     │           │
│  │   :8848     │  │   :3306     │  │   :6379     │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │ RocketMQ    │  │   Seata     │  │  Sentinel   │           │
│  │ :9876/10911 │  │   :8091     │  │   :8858     │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │SkyWalking   │  │  Prometheus  │                           │
│  │   :8080     │  │   :9090     │                           │
│  └─────────────┘  └─────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 环境准备

### 系统要求
- Linux/MacOS/Windows (with WSL2)
- Docker 20.10+
- Docker Compose 2.0+
- 至少 8GB 内存
- 至少 20GB 磁盘空间

### 安装Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# MacOS
brew install docker-compose

# Windows
# 下载 Docker Desktop for Windows
```

## 🚀 一键部署

### 1. 克隆项目

```bash
git clone https://github.com/your-repo/bookstore-smart.git
cd bookstore-smart
```

### 2. 进入部署目录

```bash
cd deploy
```

### 3. 启动所有服务

```bash
# 启动所有中间件
docker-compose up -d

# 查看启动状态
docker-compose ps
```

### 4. 等待服务就绪

```bash
# 等待2-3分钟，让所有服务启动完成
./scripts/wait-for-services.sh
```

## 📊 服务监控

### 服务列表

| 服务 | 端口 | 说明 | 访问地址 |
|------|------|------|----------|
| Nacos | 8848 | 注册配置中心 | http://localhost:8848/nacos |
| MySQL | 3306 | 数据库 | localhost:3306 |
| Redis | 6379 | 缓存 | localhost:6379 |
| RocketMQ | 9876 | NameServer | http://localhost:9876 |
| | 10911 | Broker | - |
| Seata | 8091 | 分布式事务 | http://localhost:8091 |
| Sentinel | 8858 | 限流控制台 | http://localhost:8858 |
| SkyWalking | 8080 | 链路追踪 | http://localhost:8080 |
| Prometheus | 9090 | 监控指标 | http://localhost:9090 |

### 查看服务日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f nacos
docker-compose logs -f mysql
docker-compose logs -f redis
```

## ⚙️ 配置说明

### docker-compose.yml 配置

```yaml
version: '3.8'
services:
  # Nacos配置
  nacos:
    image: nacos/nacos-server:2.2.3
    environment:
      - MODE=standalone
      - SPRING_DATASOURCE_PLATFORM=mysql
      - MYSQL_SERVICE_HOST=mysql
      - MYSQL_SERVICE_PORT=3306
      - MYSQL_SERVICE_DB_NAME=nacos
      - MYSQL_SERVICE_USER=nacos
      - MYSQL_SERVICE_PASSWORD=nacos
    ports:
      - "8848:8848"
    depends_on:
      - mysql

  # MySQL配置
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=123456
      - MYSQL_DATABASE=nacos
      - MYSQL_USER=nacos
      - MYSQL_PASSWORD=nacos
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql

  # Redis配置
  redis:
    image: redis:7.0
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  # RocketMQ配置
  rocketmq-namesrv:
    image: rocketmqinc/rocketmq:5.1.0
    ports:
      - "9876:9876"
    command: sh mqnamesrv

  rocketmq-broker:
    image: rocketmqinc/rocketmq:5.1.0
    ports:
      - "10911:10911"
      - "10909:10909"
    command: sh mqbroker -n namesrv:9876 autoCreateTopicEnable=true
    depends_on:
      - rocketmq-namesrv

  rocketmq-console:
    image: styletang/rocketmq-console-ng:1.0.0
    ports:
      - "19876:8080"
    environment:
      - JAVA_OPTS=-Drocketmq.namesrv.addr=namesrv:9876

  # Seata配置
  seata:
    image: seataio/seata-server:1.7.0
    ports:
      - "8091:8091"
    environment:
      - SEATA_CONFIG_NAME=file:/seata-server/resources/file.conf
    volumes:
      - ./seata/config:/seata-server/resources

  # Sentinel配置
  sentinel:
    image: bladex/sentinel-dashboard:1.8.6
    ports:
      - "8858:8858"
    environment:
      - SERVER_PORT=8858

  # SkyWalking配置
  skywalking:
    image: apache/skywalking-oap-server:9.5.0
    ports:
      - "11800:11800"  # gRPC
      - "8080:8080"    # UI
    environment:
      - SW_STORAGE=elasticsearch
      - SW_STORAGE_ES_CLUSTER_NODES=elasticsearch:9200
    depends_on:
      - elasticsearch

  # Elasticsearch配置（SkyWalking依赖）
  elasticsearch:
    image: elasticsearch:8.8.0
    ports:
      - "9200:9200"
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - es_data:/usr/share/elasticsearch/data

volumes:
  mysql_data:
  redis_data:
  es_data:
```

## 🔧 自定义配置

### 修改端口映射

如果需要修改端口，编辑 `docker-compose.yml`：

```yaml
# 修改Nacos端口
ports:
  - "8848:8848"  # 改为 8888:8848

# 修改MySQL端口
ports:
  - "3306:3306"  # 改为 13306:3306
```

### 调整资源配置

```yaml
# 调整MySQL内存
mysql:
  environment:
    - MYSQL_ROOT_PASSWORD=your_password
  mem_limit: 2g

# 调整Redis内存
redis:
  mem_limit: 1g
```

## 🛠️ 常用操作

### 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 启动特定服务
docker-compose up -d nacos mysql redis

# 在后台启动
docker-compose up -d -d
```

### 停止服务

```bash
# 停止并删除容器
docker-compose down

# 停止但不删除容器
docker-compose stop

# 强制停止
docker-compose kill
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart nacos mysql
```

### 更新服务

```bash
# 拉取最新镜像
docker-compose pull

# 重新构建并启动
docker-compose up -d --force-recreate
```

### 清理环境

```bash
# 清理所有容器和网络
docker-compose down -v

# 清理镜像（谨慎使用）
docker system prune -a
```

## 📈 性能优化

### Docker优化配置

```bash
# 编辑docker-compose.yml，添加性能优化参数
services:
  mysql:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G

  redis:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 1G
```

### 系统优化

```bash
# 增加文件描述符限制
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# 调整内核参数
echo "net.core.somaxconn = 65536" >> /etc/sysctl.conf
echo "vm.swappiness = 10" >> /etc/sysctl.conf
sysctl -p
```

## 🔍 故障排查

### 常见问题

#### 1. 容器启动失败

```bash
# 查看容器状态
docker-compose ps

# 查看容器日志
docker-compose logs <service_name>

# 查看具体错误
docker-compose logs <service_name> | tail -50
```

#### 2. 端口冲突

```bash
# 查看端口占用
netstat -tulpn | grep :8848

# 修改docker-compose.yml中的端口映射
```

#### 3. 内存不足

```bash
# 查看内存使用
docker stats

# 限制容器内存使用
docker-compose up -d --memory="2g" mysql
```

#### 4. 网络问题

```bash
# 查看网络
docker network ls
docker network inspect bookshop_default

# 重建网络
docker-compose down -v
docker-compose up -d
```

### 调试技巧

```bash
# 进入容器内部
docker-compose exec mysql bash
docker-compose exec redis redis-cli

# 查看容器详细信息
docker inspect <container_id>

# 查看资源使用情况
docker stats --no-stream
```

## 📚 相关文档

- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Nacos 部署指南](https://nacos.io/zh-cn/docs/quick-start-docker.html)
- [Seata 部署说明](https://seata.apache.org/zh-cn/docs/ops/deploy-starter)
- [SkyWalking 部署文档](https://skywalking.apache.org/docs/main/en/setup/backend/)

---

[返回部署指南](./quick-start.md) | [问题排查](./troubleshooting.md)

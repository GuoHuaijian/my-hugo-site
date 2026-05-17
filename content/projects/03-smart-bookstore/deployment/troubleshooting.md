# 部署问题排查

## 1. Docker 相关

### 端口冲突

```bash
# 检查端口占用
netstat -tulpn | grep :8848
netstat -tulpn | grep :3306

# 修改 docker-compose.yml 中的端口映射
# 例如: "13306:3306" 表示将宿主机的13306映射到容器的3306
```

### 容器启动失败

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs <service_name>
docker-compose logs <service_name> | tail -50

# 进入容器排查
docker-compose exec mysql bash
docker-compose exec redis redis-cli
```

### 内存不足

```bash
# 查看资源使用
docker stats --no-stream

# 限制容器内存
docker-compose up -d --memory="2g" mysql

# 在 docker-compose.yml 中配置
services:
  mysql:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
```

## 2. Nacos 相关

### Nacos 无法启动

```bash
# 检查 Nacos 日志
docker-compose logs nacos

# 检查数据库连接
# Nacos 需要 MySQL 先启动
# 确保 MySQL 端口 3306 可访问
```

### 服务注册失败

- 检查 `bootstrap.yml` 中 Nacos 地址配置
- 确认 Nacos 控制台可访问：http://localhost:8848/nacos
- 检查网络连通性：`telnet localhost 8848`

## 3. 数据库相关

### 连接失败

```bash
# 检查数据库是否运行
docker-compose ps mysql

# 直接连接测试
mysql -h127.0.0.1 -uroot -p123456 -e "SELECT 1"

# 检查连接池配置
# spring.datasource.url, username, password
```

### ShardingSphere 分片问题

- 检查分片键值是否正确
- 确认 `actual-data-nodes` 与实际数据库匹配
- 检查绑定表配置

## 4. 服务启动问题

### 依赖服务未就绪

启动顺序：Nacos → MySQL → Redis → 业务服务

```bash
# 确认 Nacos 就绪
curl http://localhost:8848/nacos/v1/ns/service/list

# 确认 MySQL 就绪
docker exec -it bookstore-mysql mysqladmin ping
```

### 配置加载失败

```bash
# 检查 Nacos 配置是否已导入
# 访问 Nacos 控制台 → 配置管理 → 配置列表

# 检查本地配置文件
cat src/main/resources/bootstrap.yml
```

## 5. MQ 相关

### RocketMQ 连接失败

```bash
# 检查 NameServer
telnet localhost 9876

# 检查 Broker
telnet localhost 10911

# 查看 Broker 日志
docker-compose logs rocketmq-broker
```

## 6. 网络调优

```bash
# 增加文件描述符限制
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# 调整内核参数
echo "net.core.somaxconn = 65536" >> /etc/sysctl.conf
echo "vm.swappiness = 10" >> /etc/sysctl.conf
sysctl -p
```

## 7. 常用诊断命令

```bash
# 查看所有容器资源使用
docker stats --no-stream

# 查看容器详细信息
docker inspect <container_id>

# 清理所有容器和数据（谨慎）
docker-compose down -v

# 重新构建并启动
docker-compose up -d --force-recreate
```

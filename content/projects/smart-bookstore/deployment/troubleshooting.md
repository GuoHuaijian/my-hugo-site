---
title: "问题排查"
description: "智慧书店项目技术文档 - 问题排查"
date: 2024-01-01
weight: 18
difficulty: 3
readTime: 25
keywords: ['问题排查', '调试', '故障', '解决方案']
---

# 问题排查

> 常见问题与解决方案

## 🔍 快速诊断

### 问题排查流程

```
1. 确认问题现象
   ↓
2. 检查服务状态
   ↓
3. 查看日志信息
   ↓
4. 分析错误原因
   ↓
5. 应用解决方案
   ↓
6. 验证修复结果
```

### 通用排查命令

```bash
# 查看所有服务状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f <service_name>

# 查看资源使用
docker stats

# 查看网络状态
docker network ls
docker network inspect bookshop_default

# 进入容器调试
docker-compose exec <service_name> bash
```

## 🚨 启动问题

### 问题1：Nacos启动失败

**现象**：
- 访问 http://localhost:8848/nacos 无法打开
- 日志显示端口占用或数据库连接失败

**解决方案**：

```bash
# 1. 检查端口占用
netstat -tulpn | grep :8848

# 2. 如果端口被占用，找到占用进程
lsof -i :8848
kill -9 <PID>

# 3. 重新启动Nacos
docker-compose restart nacos

# 4. 检查MySQL连接
docker-compose exec mysql mysql -unacos -pnacos -e "SELECT 1"

# 5. 如果MySQL连接失败，重新初始化
docker-compose down mysql
docker-compose up -d mysql
sleep 30
docker-compose up -d nacos
```

**检查Nacos日志**：
```bash
docker-compose logs nacos
```

### 问题2：MySQL启动慢

**现象**：
- MySQL容器启动需要很长时间
- 应用连接MySQL超时

**解决方案**：

```bash
# 1. 检查MySQL启动日志
docker-compose logs mysql

# 2. 优化MySQL配置
# 编辑 deploy/docker-compose.yml，添加以下配置
mysql:
  environment:
    - MYSQL_INIT_TIMEOUT=300
    - MYSQL_ROOT_PASSWORD=123456
    - MYSQL_CHARACTER_SET_SERVER=utf8mb4
    - MYSQL_COLLATION_SERVER=utf8mb4_unicode_ci

# 3. 使用更快的镜像
mysql:
  image: mysql:8.0.30
  command: --default-authentication-plugin=mysql_native_password
```

### 问题3：Redis连接失败

**现象**：
- 应用无法连接到Redis
- Sentinel控制台报连接超时

**解决方案**：

```bash
# 1. 检查Redis状态
docker-compose exec redis redis-cli ping

# 2. 如果无法连接，重启Redis
docker-compose restart redis

# 3. 检查Redis配置
docker-compose exec redis redis-cli config get requirepass

# 4. 如果需要设置密码
docker-compose exec redis redis-cli
> CONFIG SET requirepass your_password
> exit

# 5. 更新应用配置，添加密码
# application.yml
spring:
  redis:
    password: your_password
```

## 🔄 运行时问题

### 问题4：秒杀请求失败

**现象**：
- 前端点击"立即抢购"无响应
- 返回"系统繁忙"错误

**排查步骤**：

```bash
# 1. 检查网关日志
docker-compose logs gateway | grep -i error

# 2. 检查限流状态
docker-compose logs sentinel

# 3. 检查秒杀服务日志
docker-compose logs seckill-service | grep -i seckill

# 4. 检查Redis库存
docker-compose exec redis redis-cli get seckill:stock:1001

# 5. 检查MQ状态
docker-compose exec rocketmq-console curl http://localhost:19876/
```

**解决方案**：

```bash
# 1. 重启秒杀服务
docker-compose restart seckill-service

# 2. 清理Redis缓存
docker-compose exec redis redis-cli
> DEL seckill:stock:1001
> DEL seckill:soldout:1001

# 3. 检查数据库库存
docker-compose exec mysql mysql -ubookstore -pbookstore bookstore_order -e "SELECT * FROM t_inventory WHERE product_id=1001"
```

### 问题5：分布式事务异常

**现象**：
- 订单创建失败
- Seata控制台显示事务回滚

**排查步骤**：

```bash
# 1. 查看Seata控制台
# 访问 http://localhost:8091/seata

# 2. 检查全局事务状态
docker-compose logs seata | grep -i transaction

# 3. 检查分支事务状态
docker-compose logs order-service | grep -i seata
docker-compose logs inventory-service | grep -i seata

# 4. 检查undo_log表
docker-compose exec mysql mysql -ubookstore -pbookstore bookstore_order -e "SELECT * FROM undo_log ORDER BY log_created DESC LIMIT 10"
```

**解决方案**：

```bash
# 1. 重启Seata服务
docker-compose restart seata

# 2. 清理脏数据
docker-compose exec mysql mysql -ubookstore -pbookstore bookstore_order -e "DELETE FROM t_order WHERE status='CREATED' AND created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)"
docker-compose exec mysql mysql -ubookstore -pbookstore bookstore_inventory -e "UPDATE t_inventory SET available_stock = available_stock + 10 WHERE product_id=1001"

# 3. 重试订单创建
```

### 问题6：消息积压

**现象**：
- RocketMQ控制台显示消息堆积
- 订单创建延迟

**排查步骤**：

```bash
# 1. 查看MQ状态
curl http://localhost:19876/

# 2. 检查消费者状态
docker-compose logs order-service | grep -i consumer

# 3. 检查Topic状态
docker-compose exec rocketmq-broker sh mqadmin topicList -n localhost:9876

# 4. 查看消息堆积
docker-compose exec rocketmq-broker sh mqadmin consumerProgress -t seckill-topic -g order-consumer-group
```

**解决方案**：

```bash
# 1. 增加消费者数量
# 部署多个订单服务实例
docker-compose scale order-service=3

# 2. 检查消费者配置
# 确认消费者线程数设置正确
# application.yml
rocketmq:
  consumer:
    threads: 10

# 3. 清理过期消息
docker-compose exec rocketmq-broker sh mqadmin cleanExpiredMsg -n localhost:9876 -t seckill-topic
```

## 📊 性能问题

### 问题7：响应慢

**现象**：
- API响应时间超过1秒
- 前端页面加载慢

**排查步骤**：

```bash
# 1. 使用curl测试响应时间
curl -o /dev/null -s -w "%{time_total}\n" http://localhost:8000/api/v1/seckill/1001

# 2. 查看服务CPU使用率
docker stats --no-stream

# 3. 查看慢查询日志
docker-compose logs mysql | grep -i slow

# 4. 查看Redis命中率
docker-compose exec redis redis-cli info stats | grep "keyspace_hits"
docker-compose exec redis redis-cli info stats | grep "keyspace_misses"
```

**解决方案**：

```bash
# 1. 优化JVM参数
# 在service的Dockerfile中添加
ENV JAVA_OPTS="-Xms2g -Xmx2g -XX:+UseG1GC"

# 2. 添加本地缓存
# application.yml
spring:
  cache:
    type: caffeine
    caffeine:
      spec: maximumSize=10000,expireAfterWrite=5m

# 3. 优化数据库连接池
spring:
  datasource:
    hikari:
      maximum-pool-size: 50
      minimum-idle: 10
      connection-timeout: 30000
```

### 问题8：内存溢出

**现象**：
- 容器内存使用率达到100%
- 服务频繁重启

**排查步骤**：

```bash
# 1. 查看内存使用
docker stats --no-stream

# 2. 查看JVM内存
docker-compose exec <service_name> jps -l
docker-compose exec <service_name> jstat -gc <pid> 1s 10

# 3. 查看堆栈信息
docker-compose exec <service_name> jstack <pid> > heap_dump.txt
```

**解决方案**：

```bash
# 1. 限制容器内存
# docker-compose.yml
services:
  seckill-service:
    deploy:
      resources:
        limits:
          memory: 2G

# 2. 优化JVM配置
# Dockerfile
ENV JAVA_OPTS="-Xms1g -Xmx1g -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp"

# 3. 分析内存泄漏
# 使用MAT工具分析heap_dump.txt
```

## 🔧 配置问题

### 问题9：Nacos配置不生效

**现象**：
- 服务无法获取最新配置
- 配置变更后不生效

**排查步骤**：

```bash
# 1. 检查Nacos配置列表
curl -X GET "http://localhost:8848/nacos/v1/ns/instance/list?serviceName=bookstore-gateway"

# 2. 检查配置详情
curl -X GET "http://localhost:8848/nacos/v1/cs/configs?dataId=bookstore-gateway.yml&group=DEFAULT_GROUP"

# 3. 检查服务注册状态
docker-compose logs nacos | grep -i register
```

**解决方案**：

```bash
# 1. 检查命名空间配置
# application.yml
spring:
  cloud:
    nacos:
      config:
        namespace: ${spring.profiles.active}
        group: DEFAULT_GROUP
        data-id: ${spring.application.name}.yml

# 2. 重新导入配置
./scripts/import-nacos-config.sh

# 3. 重启服务
docker-compose restart <service_name>
```

### 问题10：Sentinel规则不生效

**现象**：
- 限流规则配置后不起作用
- 熔断规则未触发

**排查步骤**：

```bash
# 1. 检查Sentinel控制台
# 访问 http://localhost:8858

# 2. 查看Sentinel日志
docker-compose logs sentinel

# 3. 检查客户端连接
docker-compose logs gateway | grep -i sentinel
```

**解决方案**：

```bash
# 1. 检查客户端配置
# application.yml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8858
        port: 8719

# 2. 确保网络连通性
docker-compose exec sentinel curl http://localhost:8858

# 3. 清理Sentinel缓存
docker-compose restart gateway
```

## 🌐 网络问题

### 问题11：服务间调用失败

**现象**：
- Dubbo服务调用超时
- 微服务发现失败

**排查步骤**：

```bash
# 1. 检查服务注册
curl "http://localhost:8848/nacos/v1/ns/instance/list?serviceName=bookstore-seckill-service"

# 2. 检查网络连通性
docker-compose exec seckill-service telnet localhost:8848

# 3. 查看Dubbo日志
docker-compose logs seckill-service | grep -i dubbo
```

**解决方案**：

```bash
# 1. 检查防火墙设置
sudo ufw status
sudo ufw allow 8848

# 2. 检查Docker网络
docker network inspect bookshop_default

# 3. 重新创建网络
docker-compose down -v
docker-compose up -d
```

### 问题12：前端无法访问

**现象**：
- 前端页面无法访问
- 跨域请求失败

**排查步骤**：

```bash
# 1. 检查前端服务
docker-compose logs ui

# 2. 检查网关配置
docker-compose logs gateway

# 3. 测试API访问
curl http://localhost:8000/api/v1/health
```

**解决方案**：

```bash
# 1. 检查CORS配置
# application.yml
spring:
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]':
            allowed-origins: "*"
            allowed-methods: "*"
            allowed-headers: "*"

# 2. 重启网关服务
docker-compose restart gateway

# 3. 检查前端环境配置
# .env文件
VUE_APP_API_BASE_URL=http://localhost:8000
```

## 📝 日志管理

### 日志收集配置

```yaml
# docker-compose.yml
services:
  seckill-service:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 日志查看命令

```bash
# 查看最近100行日志
docker-compose logs --tail=100 <service_name>

# 查看错误日志
docker-compose logs <service_name> | grep -i error

# 查看特定时间段的日志
docker-compose logs --since="2024-01-01T00:00:00" <service_name>
```

### 日志分析

```bash
# 统计错误数量
docker-compose logs <service_name> | grep -i error | wc -l

# 查找高频错误
docker-compose logs <service_name> | grep -i error | sort | uniq -c | sort -nr
```

## 🚨 紧急处理

### 服务挂载应急处理

```bash
# 1. 立即重启关键服务
docker-compose restart gateway seckill-service order-service

# 2. 检查服务状态
docker-compose ps

# 3. 查看恢复情况
docker-compose logs -f seckill-service --tail=50
```

### 数据恢复

```bash
# 1. 备份数据库
docker-compose exec mysql mysqldump -ubookstore -pbookstore bookstore_order > backup.sql

# 2. 恢复数据库
docker-compose exec -T mysql mysql -ubookstore -pbookstore bookstore_order < backup.sql

# 3. 清理脏数据
docker-compose exec mysql mysql -ubookstore -pbookstore bookstore_order -e "DELETE FROM t_order WHERE status='CREATED' AND created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)"
```

## 📞 获取帮助

### 联系方式

- GitHub Issues: [提交问题](https://github.com/your-repo/bookstore-smart/issues)
- 邮箱: support@your-domain.com
- 交流群: [QQ群号]

### 提交问题模板

```markdown
## 问题描述
简要描述遇到的问题

## 环境信息
- Docker版本:
- 操作系统:
- 内存:
- CPU:

## 复现步骤
1.
2.
3.

## 错误信息
```
错误日志
```

## 预期结果
描述期望的行为

## 实际结果
描述实际发生的情况
```

---

[返回快速开始](./quick-start.md) | [Docker部署](./docker-deploy.md)

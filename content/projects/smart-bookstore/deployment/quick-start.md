---
title: "快速开始"
description: "智慧书店项目技术文档 - 快速开始"
date: 2024-01-01
weight: 16
difficulty: 1
readTime: 20
keywords: ['快速开始', '环境搭建', '运行', '入门']
---

# 快速开始

> 10分钟在本地运行完整项目

## 1. 环境要求

| 环境 | 版本要求 | 验证命令 |
|-----|---------|---------|
| JDK | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| Docker | 20.10+ | `docker -version` |
| Docker Compose | 2.0+ | `docker-compose -version` |
| Node.js | 18+ | `node -v` |

## 2. 启动中间件

```bash
# 进入部署目录
cd deploy

# 一键启动所有中间件
docker-compose up -d

# 查看启动状态
docker-compose ps
```

中间件列表：

| 服务 | 端口 | 说明 |
|------|------|------|
| Nacos | 8848 | 注册配置中心 |
| MySQL | 3306 | 数据库 |
| Redis | 6379 | 缓存 |
| RocketMQ | 9876/10911 | 消息队列 |
| Seata | 8091 | 分布式事务 |
| Sentinel | 8858 | 限流控制台 |
| SkyWalking | 8080 | 链路追踪 |

等待启动完成（约2-3分钟）：

```bash
# 检查Nacos是否就绪
curl http://localhost:8848/nacos/v1/ns/service/list

# 检查MySQL是否就绪
docker exec -it bookstore-mysql mysql -uroot -p123456 -e "SELECT 1"
```

## 3. 初始化数据库

```bash
# 执行SQL脚本
./scripts/init-database.sh

# 或手动执行
mysql -h127.0.0.1 -uroot -p123456 < sql/bookstore_user.sql
mysql -h127.0.0.1 -uroot -p123456 < sql/bookstore_product.sql
mysql -h127.0.0.1 -uroot -p123456 < sql/bookstore_order_0.sql
mysql -h127.0.0.1 -uroot -p123456 < sql/bookstore_order_1.sql
mysql -h127.0.0.1 -uroot -p123456 < sql/bookstore_inventory_0.sql
mysql -h127.0.0.1 -uroot -p123456 < sql/bookstore_inventory_1.sql
```

## 4. 导入Nacos配置

```bash
# 导入配置文件
./scripts/import-nacos-config.sh

# 或手动在Nacos控制台导入
# 访问 http://localhost:8848/nacos
# 账号：nacos / nacos
# 导入 nacos/ 目录下的配置文件
```

## 5. 启动后端服务

### 方式一：脚本启动（推荐）
```bash
./scripts/start-services.sh
```

### 方式二：逐个启动
```bash
# 1. 启动网关
cd bookstore-gateway
mvn spring-boot:run

# 2. 启动认证服务
cd bookstore-auth
mvn spring-boot:run

# 3. 启动用户服务
cd bookstore-service/bookstore-user-service
mvn spring-boot:run

# 4. 启动商品服务
cd bookstore-service/bookstore-product-service
mvn spring-boot:run

# 5. 启动库存服务
cd bookstore-service/bookstore-inventory-service
mvn spring-boot:run

# 6. 启动订单服务
cd bookstore-service/bookstore-order-service
mvn spring-boot:run

# 7. 启动秒杀服务
cd bookstore-service/bookstore-seckill-service
mvn spring-boot:run

# 8. 启动管理后台
cd bookstore-admin
mvn spring-boot:run
```

### 方式三：IDEA启动
1. 导入Maven项目
2. 配置JDK 17
3. 按顺序运行各服务的Application类

## 6. 启动前端

```bash
cd bookstore-ui

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 7. 验证

### 7.1 访问前端
打开浏览器访问：http://localhost:3000

### 7.2 测试账号

| 用户名 | 密码 | 说明 |
|--------|------|------|
| user1 | 123456 | 普通用户 |
| admin | 123456 | 管理员 |

### 7.3 功能验证
1. 登录系统
2. 进入秒杀专区
3. 点击商品详情
4. 点击"立即抢购"
5. 查看订单结果

## 8. 监控面板

| 面板 | 地址 | 账号 |
|------|------|------|
| Nacos | http://localhost:8848/nacos | nacos/nacos |
| Sentinel | http://localhost:8858 | sentinel/sentinel |
| SkyWalking | http://localhost:8080 | - |
| RocketMQ | http://localhost:19876 | - |

## 9. 常见问题

### Q1：Docker容器启动失败
检查Docker服务是否正常运行，端口是否被占用：
```bash
# 检查端口占用
netstat -an | grep 8848
netstat -an | grep 3306

# 查看容器日志
docker-compose logs nacos
docker-compose logs mysql
```

### Q2：Nacos配置导入失败
确保Nacos服务已完全启动，手动在控制台导入配置文件。

### Q3：服务启动失败
检查日志文件，查看具体错误信息：
```bash
# 查看服务日志
tail -f bookstore-gateway/target/spring-boot-app-1.0.0-SNAPSHOT/spring-boot-app-1.0.0-SNAPSHOT.log
```

### Q4：前端页面无法访问
确保后端服务都已启动，检查前端依赖是否安装成功。

### Q5：数据库连接失败
检查数据库配置，确认用户名密码正确。

---

[返回文档首页](../README.md)

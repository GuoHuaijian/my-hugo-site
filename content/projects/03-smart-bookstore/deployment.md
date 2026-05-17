# 部署运维

## 1. 环境要求

| 环境 | 版本要求 | 验证命令 |
|-----|---------|---------|
| JDK | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| Docker | 20.10+ | `docker -version` |
| Docker Compose | 2.0+ | `docker-compose -version` |
| Node.js | 18+ | `node -v` |

## 2. 快速开始（本地运行）

### 2.1 启动中间件

```bash
# 进入部署目录，一键启动所有中间件
cd deploy
docker-compose up -d

# 检查启动状态
docker-compose ps
```

中间件列表：

| 服务 | 端口 | 说明 |
|------|------|------|
| Nacos | 8848 | 注册配置中心 |
| MySQL | 3306 | 数据库 |
| Redis | 6379 | 缓存 |
| RocketMQ | 9876 / 10911 | 消息队列 |
| Seata | 8091 | 分布式事务 |
| Sentinel | 8858 | 限流控制台 |
| SkyWalking | 8080 / 11800 | 链路追踪 |

### 2.2 初始化数据库

```bash
# 执行 SQL 脚本
./scripts/init-database.sh

# 或手动导入
mysql -h127.0.0.1 -uroot -p123456 < sql/bookstore_user.sql
mysql -h127.0.0.1 -uroot -p123456 < sql/bookstore_order_0.sql
mysql -h127.0.0.1 -uroot -p123456 < sql/bookstore_order_1.sql
```

### 2.3 导入 Nacos 配置

```bash
./scripts/import-nacos-config.sh
# 或访问 http://localhost:8848/nacos (nacos/nacos) 手动导入
```

### 2.4 启动后端服务

**方式一：脚本启动**
```bash
./scripts/start-services.sh
```

**方式二：逐个启动**
```bash
# 建议启动顺序：网关 → 认证 → 用户 → 商品 → 库存 → 订单 → 秒杀 → 管理后台
cd bookstore-gateway && mvn spring-boot:run
cd bookstore-auth && mvn spring-boot:run
cd bookstore-service/bookstore-user-service && mvn spring-boot:run
cd bookstore-service/bookstore-product-service && mvn spring-boot:run
cd bookstore-service/bookstore-inventory-service && mvn spring-boot:run
cd bookstore-service/bookstore-order-service && mvn spring-boot:run
cd bookstore-service/bookstore-seckill-service && mvn spring-boot:run
cd bookstore-admin && mvn spring-boot:run
```

### 2.5 启动前端

```bash
cd bookstore-ui
npm install
npm run dev
# 访问 http://localhost:3000
```

### 2.6 验证

测试账号：

| 用户名 | 密码 | 说明 |
|--------|------|------|
| user1 | 123456 | 普通用户 |
| admin | 123456 | 管理员 |

验证流程：登录 → 秒杀专区 → 商品详情 → 立即抢购 → 查看订单结果

## 3. Docker Compose 部署架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    Docker Compose 集群                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Nacos     │  │   MySQL     │  │   Redis     │            │
│  │   :8848     │  │   :3306     │  │   :6379     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ RocketMQ    │  │   Seata     │  │  Sentinel   │            │
│  │ :9876/10911 │  │   :8091     │  │   :8858     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │SkyWalking   │  │ Prometheus  │  │Elasticsearch│            │
│  │   :8080     │  │   :9090     │  │   :9200     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 4. 常用操作

```bash
# 启动所有服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f nacos

# 进入容器
docker-compose exec mysql bash
docker-compose exec redis redis-cli

# 查看资源使用
docker stats --no-stream
```

## 5. 常见问题

| 问题 | 排查方法 |
|------|---------|
| Docker 容器启动失败 | `docker-compose logs <服务名>` |
| 端口冲突 | `netstat -tulpn \| grep :端口` |
| 内存不足 | `docker stats` 查看内存使用，限制容器内存 |
| 数据库连接失败 | 检查 MySQL 配置和用户名密码 |
| 前端页面无法访问 | 确认后端服务已全部启动，检查前端依赖安装 |

## 6. 监控面板

| 面板 | 地址 | 说明 |
|------|------|------|
| Nacos | http://localhost:8848/nacos | 服务发现、配置管理 |
| Sentinel | http://localhost:8858 | 限流规则、实时监控 |
| SkyWalking | http://localhost:8080 | 链路追踪、拓扑图 |
| RocketMQ 控制台 | http://localhost:19876 | 消息监控 |
| Prometheus | http://localhost:9090 | 指标采集 |

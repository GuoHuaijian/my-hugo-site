---
title: "部署运维指南"
description: ""
date: 2024-01-01
showTableOfContents: true
weight: 1
---

# 部署运维指南

## 环境要求

### 系统要求

| 组件 | 最低要求 | 推荐配置 | 说明 |
|------|---------|---------|------|
| CPU | 2核 | 4核 | OAP服务建议4核以上 |
| 内存 | 4GB | 8GB | 用于指标存储和计算 |
| 磁盘 | 50GB | 100GB SSD | 用于存储时序数据 |
| 网络 | 100Mbps | 1Gbps | 支持高并发访问 |

### 软件依赖

| 组件 | 版本 | 说明 |
|------|------|------|
| Java | JDK 17+ | OpenJDK或Oracle JDK |
| Maven | 3.6+ | 项目构建工具 |
| Docker | 20.10+ | 容器化部署 |
| Docker Compose | 2.0+ | 容器编排 |
| Kubernetes | 1.23+ | K8s部署（可选） |
| Node.js | 16+ | 前端构建 |
| Nginx | 1.20+ | 反向代理（可选） |

### 操作系统支持

- Linux: Ubuntu 20.04+, CentOS 8+, RHEL 8+
- Windows Server 2019+（开发环境）
- macOS（开发环境）

## 安装部署

### 1. 开发环境部署

#### 1.1 本地环境准备

```bash
# 1. 安装JDK 17
sudo apt update
sudo apt install openjdk-17-jdk

# 2. 设置环境变量
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

# 3. 验证安装
java -version
mvn -version
```

#### 1.2 下载项目

```bash
# 克隆项目
git clone https://github.com/your-org/bookstore-monitor.git
cd bookstore-monitor

# 切换到监控模块
cd monitor-service
```

#### 1.3 启动依赖服务

```bash
# 启动MySQL
docker run -d --name monitor-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=bookstore_monitor \
  -p 3306:3306 \
  mysql:8.0

# 启动Redis
docker run -d --name monitor-redis \
  -p 6379:6379 \
  redis:7.0

# 启动Elasticsearch
docker run -d --name monitor-elasticsearch \
  -e "discovery.type=single-node" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  -p 9200:9200 \
  elasticsearch:7.17.0

# 启动SkyWalking OAP
docker run -d --name monitor-oap \
  -p 11800:11800 \
  -p 12800:12800 \
  -e SW_STORAGE=elasticsearch \
  -e SW_ES_HOSTS=http://elasticsearch:9200 \
  apache/skywalking-oap-server:9.3.0
```

#### 1.4 配置应用

```yaml
# application-local.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/bookstore_monitor
    username: root
    password: password
    driver-class-name: com.mysql.cj.jdbc.Driver

  redis:
    host: localhost
    port: 6379
    database: 0

skywalking:
  oap:
    address: http://localhost:11800
    rest:
      port: 12800

# 监控配置
bookstore:
  monitor:
    storage:
      type: elasticsearch
      elasticsearch:
        hosts: http://localhost:9200
    metrics:
      enabled: true
      interval: 5000
    alert:
      enabled: true
      channels:
        - type: webhook
          url: http://localhost:8081/webhook
        - type: console
```

#### 1.5 启动应用

```bash
# 编译项目
mvn clean package

# 启动应用
java -jar target/bookstore-monitor-1.0.0-SNAPSHOT.jar \
  --spring.profiles.active=local

# 或者使用Maven
mvn spring-boot:run
```

### 2. 生产环境部署

#### 2.1 服务器准备

```bash
# 1. 创建用户
sudo useradd -m -s /bin/bash monitor

# 2. 创建目录结构
sudo mkdir -p /opt/monitor/{config,logs,data,backup}
sudo mkdir -p /opt/monitor/data/{elasticsearch,mysql,redis}

# 3. 设置权限
sudo chown -R monitor:monitor /opt/monitor
sudo chmod -R 755 /opt/monitor

# 4. 配置环境变量
sudo tee /etc/profile.d/monitor.sh << 'EOF'
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export MONITOR_HOME=/opt/monitor
export PATH=$JAVA_HOME/bin:$MONITOR_HOME/bin:$PATH
EOF

source /etc/profile.d/monitor.sh
```

#### 2.2 Docker部署

##### 2.2.1 Dockerfile构建

```dockerfile
# Dockerfile
FROM openjdk:17-jre-slim

# 安装必要的工具
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# 创建用户
RUN groupadd -r monitor && useradd -r -g monitor monitor

# 设置工作目录
WORKDIR /app

# 复制jar包
COPY target/bookstore-monitor-1.0.0-SNAPSHOT.jar app.jar

# 创建配置目录
RUN mkdir -p /app/config && \
    chown -R monitor:monitor /app

# 切换用户
USER monitor

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/monitor/api/health || exit 1

# 启动命令
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

##### 2.2.2 Docker Compose部署

```yaml
version: '3.8'

networks:
  monitor-network:
    driver: bridge

services:
  # 监控中心
  monitor:
    image: bookstore-monitor:1.0.0
    container_name: bookstore-monitor
    restart: always
    ports:
      - "8080:8080"
      - "9090:9090"
    environment:
      SPRING_PROFILES_ACTIVE: docker
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/bookstore_monitor
      SPRING_DATASOURCE_USERNAME: monitor
      SPRING_DATASOURCE_PASSWORD: ${MYSQL_PASSWORD}
      REDIS_HOST: redis
      ES_HOSTS: http://elasticsearch:9200
      SW_OAP_ADDRESS: oap:11800
    volumes:
      - ./config:/app/config
      - ./logs:/app/logs
    depends_on:
      - mysql
      - redis
      - elasticsearch
      - oap
    networks:
      - monitor-network

  # MySQL数据库
  mysql:
    image: mysql:8.0
    container_name: bookstore-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_DATABASE: bookstore_monitor
      MYSQL_USER: monitor
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql
      - ./config/mysql:/etc/mysql/conf.d
    ports:
      - "3306:3306"
    networks:
      - monitor-network

  # Redis缓存
  redis:
    image: redis:7.0
    container_name: bookstore-redis
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    networks:
      - monitor-network

  # Elasticsearch
  elasticsearch:
    image: elasticsearch:7.17.0
    container_name: bookstore-elasticsearch
    restart: always
    environment:
      discovery.type: single-node
      "ES_JAVA_OPTS": "-Xms1g -Xmx1g"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    networks:
      - monitor-network

  # SkyWalking OAP
  oap:
    image: apache/skywalking-oap-server:9.3.0
    container_name: bookstore-oap
    restart: always
    environment:
      SW_STORAGE: elasticsearch
      SW_ES_HOSTS: http://elasticsearch:9200
    ports:
      - "11800:11800"
      - "12800:12800"
    depends_on:
      - elasticsearch
    networks:
      - monitor-network

  # SkyWalking UI
  ui:
    image: apache/skywalking-ui:9.3.0
    container_name: bookstore-ui
    restart: always
    environment:
      SW_OAP_ADDRESS: oap:11800
    ports:
      - "8081:8080"
    depends_on:
      - oap
    networks:
      - monitor-network

volumes:
  mysql-data:
    driver: local
  redis-data:
    driver: local
  elasticsearch-data:
    driver: local
```

#### 2.3 Kubernetes部署

##### 2.3.1 Namespace配置

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: bookstore-monitor
  labels:
    name: bookstore-monitor
```

##### 2.3.2 ConfigMap配置

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: monitor-config
  namespace: bookstore-monitor
data:
  application.yml: |
    spring:
      datasource:
        url: jdbc:mysql://mysql-service:3306/bookstore_monitor
        username: monitor
        password: ${MYSQL_PASSWORD}
        driver-class-name: com.mysql.cj.jdbc.Driver

      redis:
        host: redis-service
        port: 6379
        database: 0

    bookstore:
      monitor:
        storage:
          type: elasticsearch
          elasticsearch:
            hosts: http://elasticsearch-service:9200
        metrics:
          enabled: true
          interval: 5000
        alert:
          enabled: true
          channels:
            - type: webhook
              url: http://webhook-service:8081/webhook
```

##### 2.3.3 Secret配置

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: monitor-secrets
  namespace: bookstore-monitor
type: Opaque
data:
  mysql-password: MWYyZDFlMmU2N2Rm
  redis-password: MWYyZDFlMmU2N2Rm
```

##### 2.3.4 Deployment配置

```yaml
# monitor-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bookstore-monitor
  namespace: bookstore-monitor
spec:
  replicas: 2
  selector:
    matchLabels:
      app: bookstore-monitor
  template:
    metadata:
      labels:
        app: bookstore-monitor
    spec:
      containers:
      - name: monitor
        image: bookstore-monitor:1.0.0
        ports:
        - containerPort: 8080
          name: http
        - containerPort: 9090
          name: metrics
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "k8s"
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: monitor-secrets
              key: mysql-password
        - name: SPRING_REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: monitor-secrets
              key: redis-password
        volumeMounts:
        - name: config
          mountPath: /app/config
        - name: logs
          mountPath: /app/logs
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /monitor/api/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /monitor/api/ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: config
        configMap:
          name: monitor-config
      - name: logs
        emptyDir: {}
```

##### 2.3.5 Service配置

```yaml
# monitor-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: bookstore-monitor-service
  namespace: bookstore-monitor
spec:
  selector:
    app: bookstore-monitor
  ports:
  - name: http
    port: 80
    targetPort: 8080
  - name: metrics
    port: 9090
    targetPort: 9090
  type: ClusterIP
```

##### 2.3.6 Ingress配置

```yaml
# monitor-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: monitor-ingress
  namespace: bookstore-monitor
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - monitor.bookstore.com
    secretName: monitor-tls
  rules:
  - host: monitor.bookstore.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: bookstore-monitor-service
            port:
              number: 80
```

### 3. 配置优化

#### 3.1 JVM参数优化

```bash
# jvm-opts.sh
export JAVA_OPTS="
-Xms2g
-Xmx4g
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:ParallelGCThreads=4
-XX:ConcGCThreads=2
-XX:InitiatingHeapOccupancyPercent=35
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/opt/monitor/logs/heap-dump.hprof
-XX:+UseStringDeduplication
-XX:MaxMetaspaceSize=256m
-XX:ReservedCodeCacheSize=256m
"
```

#### 3.2 数据库连接池配置

```yaml
# application-prod.yml
spring:
  datasource:
    url: jdbc:mysql://mysql:3306/bookstore_monitor
    username: monitor
    password: ${MYSQL_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 15000
      pool-name: BookStoreMonitorHikariCP
```

#### 3.3 Redis配置

```yaml
spring:
  redis:
    host: redis
    port: 6379
    password: ${REDIS_PASSWORD}
    database: 0
    lettuce:
      pool:
        max-active: 20
        max-idle: 10
        min-idle: 5
        max-wait: 3000
      timeout: 3000
    timeout: 3000
```

## 配置说明

### 1. 主要配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| bookstore.monitor.storage.type | String | elasticsearch | 存储类型 |
| bookstore.monitor.metrics.enabled | Boolean | true | 启用指标采集 |
| bookstore.monitor.metrics.interval | Integer | 5000 | 采集间隔(毫秒) |
| bookstore.monitor.alert.enabled | Boolean | true | 启用告警 |
| bookstore.monitor.alert.interval | Integer | 10000 | 告警检查间隔(毫秒) |
| bookstore.monitor.health-check.enabled | Boolean | true | 启用健康检查 |

### 2. 存储配置

#### 2.1 Elasticsearch配置

```yaml
bookstore:
  monitor:
    storage:
      type: elasticsearch
      elasticsearch:
        hosts:
          - http://localhost:9200
        username: ${ES_USERNAME}
        password: ${ES_PASSWORD}
        index: bookstore-monitor
        indexShards: 5
        indexReplicas: 1
        bulkActions: 2000
        bulkSize: 20
        flushInterval: 10
        concurrentRequests: 30
        dataRetention: 30d
```

#### 2.2 MySQL配置

```yaml
bookstore:
  monitor:
    storage:
      type: mysql
      mysql:
        database: bookstore_monitor
        table_prefix: monitor_
        autoCreateTable: true
        dataRetention: 90d
```

### 3. 告警配置

```yaml
bookstore:
  monitor:
    alert:
      enabled: true
      channels:
        - type: webhook
          url: http://webhook-service:8081/webhook
          timeout: 5000
          retries: 3
        - type: email
          smtp:
            host: smtp.gmail.com
            port: 587
            username: ${SMTP_USERNAME}
            password: ${SMTP_PASSWORD}
            from: monitor@bookstore.com
        - type: dingding
          webhook-url: ${DINGDING_WEBHOOK}
          secret: ${DINGDING_SECRET}
      rules:
        - name: "CPU使用率过高"
          metric: "system.cpu.usage"
          condition: ">"
          threshold: 80
          duration: 5m
          level: WARNING
          channels: ["webhook", "email"]
        - name: "HTTP 5xx错误"
          metric: "http.server.5xx"
          condition: ">"
          threshold: 10
          duration: 1m
          level: ERROR
          channels: ["webhook", "dingding"]
```

## 性能调优

### 1. 应用性能优化

#### 1.1 批量处理优化

```java
@Service
public class BatchMetricsProcessor {

    private final int batchSize = 1000;
    private final int flushInterval = 5000;

    @Scheduled(fixedRate = flushInterval)
    public void flushBatch() {
        List<Metric> batch = getBatchMetrics();
        if (!batch.isEmpty()) {
            metricsRepository.saveAll(batch);
            metricsRepository.resetBatch();
        }
    }

    @Transactional
    public void addMetrics(Metric metric) {
        metricsRepository.addToBatch(metric);

        if (metricsRepository.getBatchSize() >= batchSize) {
            flushBatch();
        }
    }
}
```

#### 1.2 缓存策略

```java
@Service
public class CacheManager {

    @Cacheable(value = "metrics", key = "#metricKey", ttl = 300)
    public Metric getMetric(String metricKey) {
        return metricsRepository.findByKey(metricKey);
    }

    @CacheEvict(value = "metrics", key = "#metric.key")
    public void saveMetric(Metric metric) {
        metricsRepository.save(metric);
    }

    @CacheEvict(value = "metrics", allEntries = true)
    public void clearCache() {
        // 定期清空缓存
    }
}
```

### 2. 数据库优化

#### 2.1 索引优化

```sql
-- 创建时间索引
CREATE INDEX idx_monitor_metrics_timestamp
ON monitor_metrics (timestamp);

-- 创建复合索引
CREATE INDEX idx_monitor_metrics_service_timestamp
ON monitor_metrics (service_name, timestamp);

-- 创建聚合索引
CREATE INDEX idx_monitor_metrics_type_timestamp
ON monitor_metrics (metric_type, timestamp);

-- 定期维护
ANALYZE TABLE monitor_metrics;
OPTIMIZE TABLE monitor_metrics;
```

#### 2.2 分表策略

```sql
-- 按月份分表
CREATE TABLE monitor_metrics_202401 (
    id BIGINT PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    timestamp BIGINT NOT NULL,
    value DOUBLE NOT NULL,
    tags JSON,
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB;

-- 创建分区视图
CREATE VIEW monitor_metrics_all AS
SELECT * FROM monitor_metrics_202401
UNION ALL SELECT * FROM monitor_metrics_202402;
```

### 3. 监控资源优化

#### 3.1 资源限制

```yaml
# k8s-resources.yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "500m"
```

#### 3.2 节点选择

```yaml
# node-selector.yaml
spec:
  template:
    spec:
      nodeSelector:
        node-role.kubernetes.io/monitor: "true"
      tolerations:
      - key: "monitor"
        operator: "Equal"
        value: "true"
        effect: "NoSchedule"
```

## 故障恢复

### 1. 服务故障恢复

#### 1.1 自动重启策略

```yaml
# deployment.yaml
spec:
  template:
    spec:
      containers:
      - name: monitor
        image: bookstore-monitor:1.0.0
        livenessProbe:
          httpGet:
            path: /monitor/api/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /monitor/api/ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
          failureThreshold: 3
        restartPolicy: Always
```

#### 1.2 故障转移

```bash
# 1. 检查服务状态
kubectl get pods -n bookstore-monitor -l app=bookstore-monitor

# 2. 手动故障转移
kubectl scale deployment bookstore-monitor --replicas=0 -n bookstore-monitor
kubectl scale deployment bookstore-monitor --replicas=2 -n bookstore-monitor

# 3. 查看重启日志
kubectl logs -n bookstore-monitor -l app=bookstore-monitor --previous
```

### 2. 数据恢复

#### 2.1 数据备份

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/opt/monitor/backup"
DATE=$(date +%Y%m%d_%H%M%S)

# 备份数据库
mysqldump -h localhost -u monitor -p book_monitor > $BACKUP_DIR/mysql_backup_$DATE.sql

# 备份Redis
redis-cli --rdb $BACKUP_DIR/redis_backup_$DATE.rdb

# 备份配置文件
cp -r /opt/monitor/config/* $BACKUP_DIR/config_backup_$DATE/

# 压缩备份
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/mysql_backup_$DATE.sql \
           $BACKUP_DIR/redis_backup_$DATE.rdb \
           $BACKUP_DIR/config_backup_$DATE/

# 删除临时文件
rm -rf $BACKUP_DIR/mysql_backup_$DATE.sql
rm -rf $BACKUP_DIR/redis_backup_$DATE.rdb
rm -rf $BACKUP_DIR/config_backup_$DATE/
```

#### 2.2 数据恢复

```bash
#!/bin/bash
# restore.sh

BACKUP_FILE="/opt/monitor/backup/backup_20240101_120000.tar.gz"

# 解压备份
tar -xzf $BACKUP_FILE -C /tmp/

# 恢复数据库
mysql -h localhost -u monitor -p book_monitor < /tmp/mysql_backup_20240101_120000.sql

# 恢复Redis
redis-cli --rdb /tmp/redis_backup_20240101_120000.rdb

# 恢复配置
cp -r /tmp/config_backup_20240101_120000/* /opt/monitor/config/

# 清理临时文件
rm -rf /tmp/mysql_backup_20240101_120000.sql
rm -rf /tmp/redis_backup_20240101_120000.rdb
rm -rf /tmp/config_backup_20240101_120000/
```

## 日志管理

### 1. 日志配置

```yaml
# logback-spring.xml
<configuration>
    <property name="LOG_PATH" value="/opt/monitor/logs"/>

    <!-- 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 文件输出 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/bookstore-monitor.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/bookstore-monitor.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
            <totalSizeCap>10GB</totalSizeCap>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 错误日志 -->
    <appender name="ERROR" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/error.log</file>
        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>ERROR</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_PATH}/error.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
            <totalSizeCap>5GB</totalSizeCap>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
        <appender-ref ref="ERROR"/>
    </root>
</configuration>
```

### 2. 日志收集

#### 2.1 ELK配置

```yaml
# filebeat.yml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /opt/monitor/logs/*.log
  fields:
    app: bookstore-monitor
    env: production
  fields_under_root: true

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "bookstore-logs-%{+yyyy.MM.dd}"
```

#### 2.2 Kibana仪表盘

```json
{
  "dashboard": {
    "title": "BookStore 监控日志",
    "panels": [
      {
        "type": "log",
        "index": "bookstore-logs-*",
        "size": 100
      },
      {
        "type": "chart",
        "index": "bookstore-logs-*",
        "aggs": {
          "terms": {
            "field": "level",
            "size": 5
          }
        }
      }
    ]
  }
}
```

## 版本管理

### 1. 版本升级

```bash
#!/bin/bash
# upgrade.sh

NEW_VERSION="1.1.0"
OLD_VERSION="1.0.0"

# 1. 备份当前版本
./backup.sh

# 2. 拉取新版本
git pull origin main
git checkout v$NEW_VERSION

# 3. 构建新版本
mvn clean package -DskipTests

# 4. 更新Docker镜像
docker build -t bookstore-monitor:$NEW_VERSION .

# 5. 更新K8s部署
kubectl set image deployment/bookstore-monitor monitor=bookstore-monitor:$NEW_VERSION -n bookstore-monitor

# 6. 滚动更新
kubectl rollout restart deployment/bookstore-monitor -n bookstore-monitor

# 7. 检查更新状态
kubectl rollout status deployment/bookstore-monitor -n bookstore-monitor
```

### 2. 版本回滚

```bash
#!/bin/bash
# rollback.sh

VERSION="1.0.0"

# 1. 回滚部署
kubectl rollout undo deployment/bookstore-monitor --to-revision=$VERSION -n bookstore-monitor

# 2. 检查回滚状态
kubectl rollout status deployment/bookstore-monitor -n bookstore-monitor

# 3. 查看日志
kubectl logs -l app=bookstore-monitor -n bookstore-monitor --tail=100
```

## 最佳实践

### 1. 监控指标

- **服务可用性**: 99.9%
- **响应时间**: P95 < 200ms
- **错误率**: < 0.1%
- **数据一致性**: 100%
- **备份完整性**: 100%

### 2. 运维规范

1. **变更管理**: 所有变更需要经过测试验证
2. **监控告警**: 24小时监控，15分钟响应
3. **文档维护**: 保持配置文档更新
4. **定期演练**: 定期进行故障演练
5. **性能评估**: 定期进行性能评估

### 3. 安全配置

```yaml
# security-config.yml
security:
  # 访问控制
  access-control:
    enabled: true
    ip-whitelist:
      - "10.0.0.0/24"
      - "172.16.0.0/12"
    ip-blacklist:
      - "192.168.1.100"

  # 数据加密
  encryption:
    enabled: true
    algorithm: AES-256-GCM
    key-rotation: 90d

  # 审计日志
  audit:
    enabled: true
    log-events:
      - "login"
      - "config_change"
      - "data_access"
```

## 版本历史

- v1.0.0 - 初始版本，基础监控功能
- v1.1.0 - 添加告警功能
- v1.2.0 - 优化性能和存储
- v1.3.0 - 增强安全性
- v1.4.0 - 添加K8s支持
- v1.5.0 - 优化监控面板

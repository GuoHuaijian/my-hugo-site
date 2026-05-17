# 监控系统部署

## Docker Compose 部署

```yaml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:2.40.0
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'

  grafana:
    image: grafana/grafana:9.5.0
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources

  skywalking-oap:
    image: apache/skywalking-oap-server:9.5.0
    ports:
      - "11800:11800"
      - "12800:12800"
    environment:
      - SW_STORAGE=elasticsearch
      - SW_STORAGE_ES_CLUSTER_NODES=elasticsearch:9200

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
  prometheus_data:
  grafana_data:
  es_data:
```

## Prometheus 配置

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'bookstore-services'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets:
        - 'gateway:8000'
        - 'seckill:8050'
        - 'order:8040'
        - 'inventory:8030'
        - 'user:8010'
        - 'admin:8060'

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

## Grafana 数据源配置

```yaml
# grafana/datasources/datasource.yml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true

  - name: Elasticsearch
    type: elasticsearch
    access: proxy
    url: http://elasticsearch:9200
    database: skywalking-*
```

## 启动监控服务

```bash
# 启动所有监控组件
docker-compose -f docker-compose-monitor.yml up -d

# 查看日志
docker-compose logs -f prometheus

# 检查服务状态
curl http://localhost:9090/-/ready
curl http://localhost:3000/api/health
```

## 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| Prometheus | http://localhost:9090 | 指标查询 |
| Grafana | http://localhost:3000 | admin/admin |
| SkyWalking UI | http://localhost:8080 | 链路追踪 |

## 数据保留策略

| 数据 | 存储 | 保留时间 |
|------|------|---------|
| 指标数据 | Prometheus TSDB | 30天 |
| 追踪数据 | Elasticsearch | 7天 |
| 日志数据 | Elasticsearch | 30天 |
| 告警记录 | MySQL | 90天 |

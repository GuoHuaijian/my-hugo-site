# 告警系统配置

## 告警规则类型

### 阈值告警

```yaml
# CPU 使用率告警
- name: "CPU使用率过高"
  description: "CPU使用率超过80%，持续5分钟"
  metric: "system.cpu.usage"
  condition: ">"
  threshold: 80.0
  duration: "5m"
  level: "WARNING"
  channels: ["webhook", "email"]
  recovery:
    enabled: true
    delay: "10m"
```

### 趋势告警

```yaml
- name: "错误率上升趋势"
  description: "错误率在5分钟内持续上升"
  metric: "http.server.requests.error.rate"
  condition: "rate_increase"
  threshold: 0.2
  window: "5m"
  level: "CRITICAL"
```

### 异常检测

```yaml
- name: "请求量异常波动"
  description: "请求量突然下降超过50%"
  metric: "seckill.requests.total"
  condition: "anomaly_drop"
  threshold: 0.5
  window: "10m"
```

## 告警级别

| 级别 | 颜色 | 响应时间 | 通知方式 |
|------|------|---------|---------|
| INFO | 蓝色 | 无 | 记录日志 |
| WARNING | 黄色 | 30分钟 | 邮件 + 钉钉 |
| CRITICAL | 橙色 | 15分钟 | 短信 + 电话 |
| EMERGENCY | 红色 | 5分钟 | 所有渠道 |

## 告警通知配置

### 钉钉通知

```yaml
dingtalk:
  enabled: true
  webhook: "https://oapi.dingtalk.com/robot/send?access_token=xxx"
  secret: "your-secret"  # 加签模式
  at:
    atMobiles: ["13800138000"]
    isAtAll: false
```

### 邮件通知

```yaml
email:
  enabled: true
  host: "smtp.example.com"
  port: 465
  username: "monitor@example.com"
  password: "your-password"
  to: ["admin@example.com", "ops@example.com"]
```

### 自定义 Webhook

```yaml
webhook:
  enabled: true
  url: "http://your-api/alert/callback"
  method: "POST"
  headers:
    Content-Type: "application/json"
    Authorization: "Bearer your-token"
```

## 告警规则示例（Prometheus）

```yaml
groups:
  - name: bookstore-alerts
    rules:
      # 服务可用性告警
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "服务 {{ $labels.instance }} 不可用"

      # 高延迟告警
      - alert: HighLatency
        expr: http_server_request_duration_seconds{quantile="0.99"} > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "服务 {{ $labels.instance }} 99分位响应时间超过2秒"

      # 错误率告警
      - alert: HighErrorRate
        expr: rate(http_server_requests_seconds_count{status=~"5.."}[5m]) > 0.05
        for: 3m
        labels:
          severity: critical
        annotations:
          summary: "服务 {{ $labels.instance }} 错误率超过5%"

      # 秒杀库存告警
      - alert: SeckillStockLow
        expr: seckill_stock_available < 100
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "秒杀商品库存不足，当前库存: {{ $value }}"
```

## 告警静默

```yaml
silences:
  - name: "维护窗口"
    description: "系统维护期间静默"
    schedule: "0 2 * * 0"  # 每周日凌晨2点
    duration: "4h"
    matchers:
      - name: "alertname"
        value: ".*"
```

---
title: "🚨 告警系统配置"
description: "智能告警规则配置、多渠道通知和告警策略优化"
date: 2024-01-01
showTableOfContents: true
weight: 1
---

# 🚨 告警系统配置

## 📋 告警规则

### 1. 告警规则类型

#### 阈值告警
基于指标值是否超过预设阈值进行告警。

```yaml
# CPU使用率告警
- name: "CPU使用率过高"
  description: "CPU使用率超过80%，持续5分钟"
  enabled: true

  # 指标选择
  metric: "system.cpu.usage"
  labels:
    mode: "user"

  # 条件设置
  condition: ">"
  threshold: 80.0

  # 持续时间
  duration: "5m"

  # 告警级别
  level: "WARNING"

  # 通知渠道
  channels: ["webhook", "email"]

  # 恢复通知
  recovery:
    enabled: true
    delay: "10m"
```

#### 趋势告警
基于指标值的变化趋势进行告警。

```yaml
# 内存使用率增长趋势告警
- name: "内存使用率快速上涨"
  description: "内存使用率在10分钟内增长超过20%"
  enabled: true

  metric: "system.memory.usage"

  # 趋势分析
  trend:
    operator: ">"
    threshold: 20.0
    window: "10m"

  level: "CRITICAL"
  channels: ["dingtalk"]
```

#### 变化率告警
基于指标值的变化率进行告警。

```yaml
# 错误率突然增加告警
- name: "错误率突然增加"
  description: "错误率在5分钟内从1%增长到5%"
  enabled: true

  metric: "http.server.errors.rate"

  # 变化率计算
  change_rate:
    operator: ">"
    threshold: 5.0
    baseline_window: "5m"
    current_window: "5m"

  level: "CRITICAL"
  channels: ["all"]
```

#### 组合告警
多个条件组合的复合告警。

```yaml
# 系统综合告警
- name: "系统综合告警"
  description: "CPU和内存同时使用率过高"
  enabled: true

  # 条件组合
  conditions:
    - metric: "system.cpu.usage"
      operator: ">"
      threshold: 80.0
    - metric: "system.memory.usage"
      operator: ">"
      threshold: 85.0

  # 逻辑关系：AND
  logic: "AND"

  level: "CRITICAL"
  channels: ["sms", "phone"]
```

### 2. 告警级别定义

| 级别 | 描述 | 通知方式 | 响应时间 |
|------|------|----------|----------|
| INFO | 信息性通知 | 邮件、Webhook | 1小时 |
| WARNING | 警告 | 邮件、钉钉 | 30分钟 |
| CRITICAL | 严重 | 短信、电话、钉钉 | 5分钟 |
| EMERGENCY | 紧急 | 所有渠道、立即 | 1分钟 |

#### 告警级别配置
```yaml
alert_levels:
  INFO:
    color: "#17a2b8"
    icon: "ℹ️"
    escalation_timeout: "1h"

  WARNING:
    color: "#ffc107"
    icon: "⚠️"
    escalation_timeout: "30m"

  CRITICAL:
    color: "#dc3545"
    icon: "🚨"
    escalation_timeout: "5m"

  EMERGENCY:
    color: "#721c24"
    icon: "🔥"
    escalation_timeout: "1m"
```

## 🔧 通知渠道

### 1. 邮件通知
```yaml
channels:
  email:
    enabled: true
    smtp:
      host: "smtp.gmail.com"
      port: 587
      username: "monitor@bookstore.com"
      password: "${SMTP_PASSWORD}"
      from: "noreply@bookstore.com"

    to:
      - "ops@bookstore.com"
      - "dev@bookstore.com"

    # 模板配置
    templates:
      alert: |
        <h2>告警通知</h2>
        <p><strong>告警名称：</strong>{{ .Alert.Name }}</p>
        <p><strong>告警级别：</strong>{{ .Level }}</p>
        <p><strong>告警时间：</strong>{{ .StartsAt }}</p>
        <p><strong>告警描述：</strong>{{ .Description }}</p>

      recovery: |
        <h2>恢复通知</h2>
        <p><strong>告警名称：</strong>{{ .Alert.Name }}</p>
        <p><strong>恢复时间：</strong>{{ .EndsAt }}</p>
        <p><strong>持续时间：</strong>{{ .Duration }}</p>
```

### 2. 钉钉通知
```yaml
channels:
  dingtalk:
    enabled: true
    webhook_url: "${DINGTALK_WEBHOOK}"
    secret: "${DINGTALK_SECRET}"

    # 消息格式
    message:
      msgtype: "actionCard"
      actionCard:
        title: "【{{ .Level }}】{{ .Alert.Name }}"
        text: |
          ##### {{ .Alert.Description }}
          ---
          **告警时间：** {{ .StartsAt }}
          **指标名称：** {{ .Metric.Name }}
          **当前值：** {{ .Value }}
          **阈值：** {{ .Threshold }}
          **持续时间：** {{ .Duration }}

          [查看详情]({{ .DashboardUrl }})

          ---
          来自智慧书店监控系统
        btnOrientation: "0"
        singleTitle: "查看详情"
        singleURL: "{{ .DashboardUrl }}"
```

### 3. 企业微信通知
```yaml
channels:
  wechat:
    enabled: true
    webhook_url: "${WECHAT_WEBHOOK}"

    # 消息内容
    message:
      msgtype: "markdown"
      markdown:
        content: |
          ### 🚨 {{ .Level }} - {{ .Alert.Name }}

          > {{ .Alert.Description }}

          **告警时间：** {{ .StartsAt }}
          **指标：** {{ .Metric.Name }}
          **当前值：** {{ .Value }}
          **阈值：** {{ .Threshold }}

          [查看详情]({{ .DashboardUrl }})
```

### 4. Webhook通知
```yaml
channels:
  webhook:
    enabled: true
    url: "${WEBHOOK_URL}"
    method: "POST"
    headers:
      Content-Type: "application/json"
      Authorization: "Bearer ${WEBHOOK_TOKEN}"

    # 请求体模板
    template: |
      {
        "alert": {
          "name": "{{ .Alert.Name }}",
          "level": "{{ .Level }}",
          "description": "{{ .Alert.Description }}",
          "timestamp": "{{ .StartsAt }}",
          "metric": {
            "name": "{{ .Metric.Name }}",
            "value": {{ .Value }},
            "threshold": {{ .Threshold }}
          },
          "tags": {{ .Tags }},
          "labels": {{ .Labels }}
        },
        "context": {
          "service": "{{ .Service.Name }}",
          "environment": "{{ .Environment }}"
        }
      }
```

### 5. Slack通知
```yaml
channels:
  slack:
    enabled: true
    webhook_url: "${SLACK_WEBHOOK}"

    # 消息格式
    message:
      text: "🚨 {{ .Level }}: {{ .Alert.Name }}"
      attachments:
        - color: "{{ .Level | toColor }}"
          fields:
            - title: "描述"
              value: "{{ .Alert.Description }}"
              short: false
            - title: "指标"
              value: "{{ .Metric.Name }} = {{ .Value }}"
              short: true
            - title: "阈值"
              value: "{{ .Threshold }}"
              short: true
            - title: "时间"
              value: "{{ .StartsAt }}"
              short: true
```

## 📊 告警策略

### 1. 告警抑制

#### 时间窗口抑制
```yaml
alerting:
  inhibition:
    # 同一指标告警抑制
    same_metric:
      enabled: true
      window: "10m"
      levels: ["WARNING", "CRITICAL"]

    # 同服务告警抑制
    same_service:
      enabled: true
      window: "30m"
      max_active: 5

    # 集群级别抑制
    cluster:
      enabled: true
      window: "1h"
      condition: "cluster_health == 'degraded'"
```

#### 静默期配置
```yaml
silences:
  # 自动静默
  automatic:
    enabled: true
    rules:
      - name: "部署期间静默"
        condition: "deployment_active == true"
        duration: "2h"
        channels: ["email", "slack"]

      - name: "维护窗口静默"
        condition: "hour >= 22 || hour <= 6"
        duration: "8h"
        channels: ["all"]
```

### 2. 告警升级

#### 升级策略
```yaml
escalation:
  # 默认升级策略
  default:
    levels: ["WARNING", "CRITICAL", "EMERGENCY"]
    delays: ["10m", "5m", "1m"]
    recipients:
      WARNING: ["ops-team"]
      CRITICAL: ["on-call"]
      EMERGENCY: ["all-on-call"]

  # 自定义升级策略
  custom:
    - name: "数据库告警"
      metric: "database.*"
      levels: ["WARNING", "CRITICAL"]
      delays: ["5m", "2m"]
      recipients:
        WARNING: ["dba-team"]
        CRITICAL: ["dba-lead", "dev-lead"]
```

### 3. 告警聚合

#### 聚合规则
```yaml
aggregation:
  # 按服务聚合
  by_service:
    enabled: true
    window: "5m"
    max_alerts: 10

  # 按标签聚合
  by_labels:
    enabled: true
    group_by: ["service", "environment"]
    max_alerts_per_group: 5

  # 按时间聚合
  by_time:
    enabled: true
    window: "15m"
    collapse: true
```

### 4. 告警模板

#### 告警模板定义
```yaml
templates:
  # 标准告警模板
  standard:
    subject: "[{{ .Level }}] {{ .Service.Name }} - {{ .Alert.Name }}"
    body: |
      ## 告警信息

      **名称：** {{ .Alert.Name }}
      **级别：** {{ .Level }}
      **时间：** {{ .StartsAt }}

      ## 详细信息

      **指标：** {{ .Metric.Name }}
      **当前值：** {{ .Value }}
      **阈值：** {{ .Threshold }}
      **持续时间：** {{ .Duration }}

      ## 服务信息

      **服务：** {{ .Service.Name }}
      **环境：** {{ .Environment }}
      **实例：** {{ .Service.Instance }}

      ## 处理建议

      {{ .Alert.Suggestion }}

      ---
      [查看仪表盘]({{ .DashboardUrl }}) | [查看详情]({{ .DetailsUrl }})

  # 紧急告警模板
  emergency:
    subject: "🚨【紧急】{{ .Service.Name }} 发生严重故障"
    body: |
      # 🚨 紧急告警

      **{{ .Alert.Name }}**

      ## 告警详情
      - **级别：** {{ .Level }}
      - **时间：** {{ .StartsAt }}
      - **指标：** {{ .Metric.Name }}
      - **当前值：** {{ .Value }}
      - **阈值：** {{ .Threshold }}

      ## 立即行动
      {{ .Alert.Action }}

      ---
      📞 **紧急联系人：** {{ .Emergency.Contact }}

      [查看详情]({{ .DashboardUrl }})
```

## 🛠️ 高级配置

### 1. 告警路由
```yaml
routing:
  # 路由规则
  rules:
    - name: "生产环境路由"
      match:
        labels:
          environment: "production"
      receiver: "production-receiver"
      continue: false

    - name: "开发环境路由"
      match:
        labels:
          environment: "development"
      receiver: "development-receiver"
      continue: true

    - name: "默认路由"
      receiver: "default-receiver"

  # 接收器配置
  receivers:
    - name: "production-receiver"
      email_configs:
        - to: "ops@bookstore.com"
          send_resolved: true
      webhook_configs:
        - url: "${PRODUCTION_WEBHOOK}"
          send_resolved: true

    - name: "development-receiver"
      email_configs:
        - to: "dev-team@bookstore.com"
          send_resolved: false
```

### 2. 告警持久化
```yaml
storage:
  # 数据库存储
  database:
    enabled: true
    type: "mysql"
    url: "${DATABASE_URL}"
    table: "alert_history"

    # 保留策略
    retention:
      active: "30d"
      resolved: "90d"
      suppressed: "7d"

  # 文件存储
  file:
    enabled: true
    path: "/var/log/monitor/alerts"
    format: "json"
    rotation: "daily"
    retention: "30d"
```

### 3. 告警查询
```yaml
query:
  # SQL查询
  sql:
    enabled: true
    max_results: 1000
    timeout: "30s"

  # PromQL查询
  promql:
    enabled: true
    max_range: "7d"
    step: "1m"

  # API查询
  api:
    enabled: true
    base_url: "${API_URL}"
    auth_token: "${API_TOKEN}"
```

## 🔍 告警最佳实践

### 1. 告警设计原则

#### 避免告警风暴
- 设置合理的告警阈值
- 使用告警聚合和抑制
- 避免过于敏感的告警规则

#### 告警分级管理
- 按严重程度分级
- 不同级别通知不同人员
- 设置响应时间要求

#### 告警信息完整
- 包含足够的上下文信息
- 提供处理建议
- 包含查看详情的链接

### 2. 告警优化建议

#### 阈值设置
```yaml
# 合理的阈值设置
thresholds:
  cpu:
    warning: 70
    critical: 85
    emergency: 95

  memory:
    warning: 75
    critical: 85
    emergency: 95

  disk:
    warning: 80
    critical: 90
    emergency: 95

  response_time:
    warning: 1000
    critical: 5000
    emergency: 10000
```

#### 告警规则示例
```yaml
# 业务相关告警规则
business_alerts:
  # 秒杀成功率
  seckill_success_rate:
    metric: "seckill.success.rate"
    condition: "<"
    threshold: 90.0
    duration: "5m"
    level: "WARNING"

  # 订单处理时间
  order_processing_time:
    metric: "order.processing.time"
    condition: ">"
    threshold: 3000
    duration: "3m"
    level: "CRITICAL"

  # 支付失败率
  payment_failure_rate:
    metric: "payment.failure.rate"
    condition: ">"
    threshold: 5.0
    duration: "5m"
    level: "CRITICAL"

  # 库存不足
  low_stock:
    metric: "inventory.stock.level"
    condition: "<"
    threshold: 10
    duration: "1m"
    level: "WARNING"
```

---

> 💡 **提示**：合理的告警配置是监控系统有效运行的关键。建议根据业务特点定制告警规则，避免告警疲劳，确保真正的故障能够及时被发现和处理。
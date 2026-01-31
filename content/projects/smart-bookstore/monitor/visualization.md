---
title: "可视化面板"
description: ""
date: 2024-01-01
showTableOfContents: true
weight: 1
---

# 可视化面板

## 面板概述

BookStore监控系统提供了丰富的可视化界面，通过美观的图表和直观的布局，帮助运维人员和开发人员快速了解系统状态和性能指标。监控面板基于Prometheus和Grafana构建，支持实时数据展示和历史数据分析。

## 面板结构

### 1. 主控面板

主控面板展示系统的关键指标概览：

```
┌─────────────────────────────────────────────────┐
│                   BookStore 监控                │
├─────────────────────────────────────────────────┤
│  ┌───────────┐ ┌───────────┐ ┌───────────┐     │
│  │   系统状态   │   服务状态   │   业务指标   │     │
│  │CPU: 45%    │ 服务: 12/15 │ QPS: 1523  │     │
│  │内存: 67%   │ 健康: 80%   │ 响应: 89ms │     │
│  │           │ 异常: 2     │ 成功率:98% │     │
│  └───────────┘ └───────────┘ └───────────┘     │
│                                                 │
│  ┌─────────────────────────────────────────────┐ │
│  │               实时流量图                      │ │
│  │                                           │ │
│  └─────────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐     │
│  │   告警状态   │   资源使用   │   趋势分析   │     │
│  │活跃: 3    │ CPU: 45%   │ 7日趋势     │     │
│  │处理中: 5  │ 内存: 67%  │ 月度对比     │     │
│  │已解决: 20 │ 磁盘: 32%  │ 预测分析     │     │
│  └───────────┘ └───────────┘ └───────────┘     │
└─────────────────────────────────────────────────┘
```

### 2. 系统监控面板

#### 2.1 资源使用情况

**CPU使用率**
```promql
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

**内存使用率**
```promql
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```

**磁盘使用率**
```promql
(1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100 by (device)
```

#### 2.2 网络流量

```promql
sum by (instance) (rate(node_network_receive_bytes_total[5m]))
sum by (instance) (rate(node_network_transmit_bytes_total[5m]))
```

### 3. 业务监控面板

#### 3.1 订单统计

```promql
# 总订单数
increase(bookstore_order_total_count[1h])

# 成功率
rate(bookstore_order_success_count[5m]) / rate(bookstore_order_total_count[5m])

# 平均响应时间
histogram_quantile(0.95, sum(rate(bookstore_order_duration_seconds_bucket[5m])) by (le))
```

#### 3.2 秒杀活动

```promql
# 秒杀请求数
rate(bookstore_seckill_requests_total[5m])

# 库存变化
bookstore_seckill_inventory{item_id="item123"}

# 成功率
rate(bookstore_seckill_success_count[5m]) / rate(bookstore_seckill_requests_total[5m])
```

### 4. 服务监控面板

#### 4.1 响应时间分布

```promql
# 服务响应时间 P95
histogram_quantile(0.95, sum(rate(http_server_requests_duration_seconds_bucket[5m])) by (le, service))

# 服务响应时间 P99
histogram_quantile(0.99, sum(rate(http_server_requests_duration_seconds_bucket[5m])) by (le, service))
```

#### 4.2 错误率统计

```promql
# HTTP错误率
sum(rate(http_server_requests_total{status=~"5.."}[5m])) by (service) / sum(rate(http_server_requests_total[5m])) by (service)

# 业务错误率
rate(bookstore_error_count[5m]) / rate(bookstore_request_count[5m])
```

## 图表配置

### 1. 图表类型

| 类型 | 适用场景 | 配置示例 |
|------|---------|----------|
| Line Chart | 时间序列数据 | 显示QPS、响应时间变化 |
| Bar Chart | 对比数据 | 显示不同服务的错误率 |
| Pie Chart | 占比数据 | 显示资源使用占比 |
| Heatmap | 热力图 | 显示时间分布情况 |
| Gauge | 实时数值 | 显示当前CPU使用率 |
| Table | 数据列表 | 显示所有服务状态 |

### 2. 仪表盘定制

#### 2.1 自定义仪表盘

创建个性化仪表盘：

```json
{
  "dashboard": {
    "title": "BookStore 业务监控",
    "panels": [
      {
        "title": "QPS趋势",
        "type": "graph",
        "metrics": ["bookstore_qps_total"],
        "interval": "1m",
        "height": "400px"
      },
      {
        "title": "响应时间分布",
        "type": "histogram",
        "metrics": ["bookstore_response_duration_seconds_bucket"],
        "legend": true
      }
    ]
  }
}
```

#### 2.2 面板模板

```yaml
# 面板模板配置
panel_templates:
  - name: 业务指标卡片
    type: stat
    field: business_metric
    color: blue
    suffix: " req/s"

  - name: 服务健康状态
    type: gauge
    field: health_status
    min: 0
    max: 100

  - name: 资源使用趋势
    type: graph
    field: resource_usage
    interval: 1m
    stacked: false
```

### 3. 主题定制

```css
/* 自定义主题 */
.dashboard {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #f5222d;
  --background-color: #f0f2f5;
}

/* 图表样式 */
.chart-container {
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 状态指示器 */
.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}

.status-healthy { background: #52c41a; }
.status-warning { background: #faad14; }
.status-error { background: #f5222d; }
```

## API接口使用

### 1. 获取面板数据

```bash
# 获取仪表盘配置
curl "http://localhost:8080/monitor/api/dashboard/config"

# 获取实时数据
curl "http://localhost:8080/monitor/api/dashboard/data?panelId=123"

# 获取历史数据
curl "http://localhost:8080/monitor/api/dashboard/history?panelId=123&range=1h"
```

### 2. 仪表盘管理API

```bash
# 创建仪表盘
curl -X POST "http://localhost:8080/monitor/api/dashboard" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "自定义仪表盘",
    "description": "业务监控面板",
    "panels": [...]
  }'

# 更新仪表盘
curl -X PUT "http://localhost:8080/monitor/api/dashboard/123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "更新后的名称",
    "panels": [...]
  }'

# 删除仪表盘
curl -X DELETE "http://localhost:8080/monitor/api/dashboard/123"
```

### 3. WebSocket 实时更新

```javascript
// 实时数据订阅
const ws = new WebSocket('ws://localhost:8080/monitor/dashboard/realtime');

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  updateDashboard(data);
};

// 重新连接
ws.onclose = function() {
  setTimeout(() => {
    ws = new WebSocket('ws://localhost:8080/monitor/dashboard/realtime');
  }, 5000);
};
```

## 大屏展示方案

### 1. 大屏布局设计

```
┌─────────────────────────────────────────────────────────────────────┐
│                           BookStore 运营监控大屏                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │      实时数据      │      服务状态      │      业务指标      │        │
│  │                 │                 │                 │        │
│  │  QPS: 1523      │ 服务: 12/15     │ 订单: 4567      │        │
│  │ 响应: 89ms      │ 健康: 80%       │ 成功率: 98%     │        │
│  │                │ 异常: 2          │ 峰值: 234       │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        实时流量图                                  │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │      告警信息      │      资源监控      │      趋势分析      │        │
│  │                 │                 │                 │        │
│  │ 活跃告警: 3     │ CPU: 45%        │ 7日趋势         │        │
│  │ 处理中: 5       │ 内存: 67%       │ 月度对比        │        │
│  │                │ 磁盘: 32%       │ 预测分析        │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. 大屏配置

```yaml
# 大屏配置文件
big_screen:
  title: "BookStore 运营监控"
  background: "#000033"
  font_color: "#ffffff"
  layout:
    - id: "realtime"
      type: "realtime"
      position: [0, 0, 33, 30]
      components: ["qps", "response_time"]

    - id: "service"
      type: "service_status"
      position: [33, 0, 33, 30]
      components: ["health", "errors"]

    - id: "business"
      type: "business_metrics"
      position: [66, 0, 33, 30]
      components: ["orders", "success_rate"]

    - id: "traffic"
      type: "line_chart"
      position: [0, 30, 100, 40]
      height: "500px"

    - id: "alerts"
      type: "alert_list"
      position: [0, 70, 33, 30]
      max_items: 10

    - id: "resources"
      type: "resource_chart"
      position: [33, 70, 33, 30]

    - id: "trends"
      type: "trend_analysis"
      position: [66, 70, 33, 30]
```

### 3. 大屏部署

```bash
# 1. 安装依赖
npm install -g electron

# 2. 构建大屏应用
cd monitor/big-screen
npm install
npm run build

# 3. 启动大屏
npm start

# 4. 全屏模式
npm run fullscreen
```

### 4. 大屏功能特性

- **实时更新**: WebSocket实时推送数据，刷新频率可配置
- **自适应**: 支持不同分辨率的屏幕适配
- **主题切换**: 支持深色/浅色主题切换
- **全屏展示**: 支持F11全屏模式
- **导出功能**: 支持截图导出和PDF生成
- **告警高亮**: 重要告警信息闪烁提醒
- **交互操作**: 支持点击查看详情

## 最佳实践

### 1. 面板设计原则

- **信息分层**: 重要指标放在显眼位置
- **逻辑分组**: 相关功能放在一起
- **数据精简**: 避免信息过载
- **配色统一**: 使用统一的色彩方案
- **响应式**: 支持不同设备访问

### 2. 性能优化

```javascript
// 防抖处理
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 缓存机制
const dataCache = new Map();

async function fetchPanelData(panelId) {
  if (dataCache.has(panelId)) {
    return dataCache.get(panelId);
  }

  const data = await fetch(`/api/dashboard/${panelId}`);
  dataCache.set(panelId, data);
  setTimeout(() => dataCache.delete(panelId), 30000);

  return data;
}
```

### 3. 监控告警联动

```javascript
// 面板异常处理
function handlePanelAnomaly(panelId, data) {
  const threshold = getThreshold(panelId);

  if (data.value > threshold) {
    showAlert(panelId, data);
    sendAlert(panelId, data);
    updatePanelStyle(panelId, 'error');
  }
}

// 告警状态同步
function syncAlertStatus(alerts) {
  alerts.forEach(alert => {
    updatePanelIndicator(alert.panelId, alert.status);
  });
}
```

## 更新日志

- v1.0.0 - 初始版本，基础监控面板
- v1.1.0 - 添加自定义仪表盘功能
- v1.2.0 - 支持实时数据更新
- v1.3.0 - 大屏展示功能
- v1.4.0 - API接口开放
- v1.5.0 - 主题定制功能

# 监控故障排查

## 常见问题

### 1. Prometheus 无法抓取指标

**现象**：Target 显示 DOWN

**排查步骤**：
```bash
# 1. 检查 Prometheus 配置
curl http://localhost:9090/api/v1/targets

# 2. 检查服务是否正常
curl http://localhost:8000/actuator/health

# 3. 检查指标端点
curl http://localhost:8000/actuator/prometheus

# 4. 查看 Prometheus 日志
docker-compose logs prometheus
```

**常见原因**：
- 服务未启动
- 网络不通（Docker 网络问题）
- metrics_path 配置错误
- 防火墙阻止端口

### 2. Grafana 面板无数据

**排查步骤**：
```bash
# 1. 检查数据源连接
# Grafana UI → Configuration → Data Sources → 点击数据源 → Test

# 2. 验证 Prometheus 中有数据
curl 'http://localhost:9090/api/v1/query?query=up'

# 3. 检查面板查询语句
# 在编辑模式中检查 PromQL 语法
```

**常见原因**：
- 数据源配置错误
- PromQL 语法错误
- 时间范围选择不当
- 指标名变更

### 3. SkyWalking Agent 未上报

**排查步骤**：
```bash
# 1. 检查 Agent 日志
tail -f logs/skywalking-agent.log

# 2. 验证 gRPC 连接
telnet localhost 11800

# 3. 检查 OAP 服务日志
docker-compose logs skywalking-oap
```

**常见原因**：
- Agent 版本不兼容
- gRPC 端口无法连接
- 服务名配置冲突
- Agent 未正确挂载

### 4. 告警未触发

**排查步骤**：
```bash
# 1. 检查告警规则
curl http://localhost:9090/api/v1/rules

# 2. 手动测试告警
# 在 Prometheus UI 中执行告警表达式

# 3. 检查 AlertManager
curl http://localhost:9093/api/v2/status
```

**常见原因**：
- 告警规则语法错误
- 阈值设置不合理
- 持续时间过长
- Webhook 地址不可达

### 5. 指标采集延迟

**排查步骤**：
```bash
# 1. 检查 scrape 间隔配置
# prometheus.yml → global.scrape_interval

# 2. 检查存储性能
curl http://localhost:9090/api/v1/status/tsdb
```

**常见原因**：
- scrape_interval 过长
- 存储写入瓶颈
- 网络延迟
- 指标数量过多

## 日志分析

```bash
# 查看应用日志
docker-compose logs -f seckill-service

# 搜索异常
docker-compose logs seckill-service | grep ERROR

# 查看 SkyWalking 日志
docker-compose logs skywalking-oap

# 查看 Prometheus 日志
docker-compose logs prometheus

# 查看 Grafana 日志
docker-compose logs grafana
```

## 性能优化

| 问题 | 优化方案 |
|------|---------|
| 指标采集慢 | 增加 scrape_interval，减少指标数量 |
| 存储空间不足 | 缩短数据保留时间，增加磁盘 |
| 查询响应慢 | 减少查询范围，使用 Recording Rules |
| Agent 内存高 | 调整 Agent 内存限制，减少采样率 |
| 告警通知延迟 | 减少评估间隔，优化通知渠道 |

## 监控自检

```bash
# 监控系统健康检查脚本
#!/bin/bash
echo "=== 监控系统自检 ==="

echo "1. Prometheus 状态:"
curl -s http://localhost:9090/-/ready

echo -e "\n2. Grafana 状态:"
curl -s http://localhost:3000/api/health | jq .

echo -e "\n3. SkyWalking 状态:"
curl -s http://localhost:12800/health

echo -e "\n4. 目标抓取状态:"
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job, health}'

echo -e "\n5. 告警规则状态:"
curl -s http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[] | {name, state}'
```

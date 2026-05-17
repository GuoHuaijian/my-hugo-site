# 配置参考手册

所有配置统一使用 `sloth.*` 前缀，按模块分组。每个 starter 均支持通过 `@ConditionalOnMissingBean` 覆盖默认 Bean。

## sloth.web.*

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `sloth.web.response-wrapper` | `boolean` | `true` | 是否启用统一响应包装 |
| `sloth.web.xss-enabled` | `boolean` | `true` | 是否启用 XSS 防护 |
| `sloth.web.xss-exclude-urls` | `Set<String>` | `[]` | XSS 过滤排除的 URL |
| `sloth.web.body-cache-enabled` | `boolean` | `false` | 是否启用请求体缓存（支持多次读取 @RequestBody） |
| `sloth.web.access-log-enabled` | `boolean` | `true` | 是否启用 API 访问日志事件发布 |
| `sloth.web.gzip.enabled` | `boolean` | `false` | 是否启用 Gzip 响应压缩 |
| `sloth.web.gzip.min-size` | `int` | `1024` | 启用压缩的最小响应体大小（字节） |
| `sloth.web.gzip.mime-types` | `String[]` | `text/html,text/xml,text/plain,text/css,application/json,application/javascript` | 启用压缩的 MIME 类型 |

## sloth.redis.*

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `sloth.redis.enabled` | `boolean` | `true` | 是否启用 Redis Starter |
| `sloth.redis.key-prefix` | `String` | `sloth:` | 统一业务 key 前缀 |
| `sloth.redis.lock-wait-time` | `long` | `3` | 分布式锁默认等待时间（秒） |
| `sloth.redis.lock-lease-time` | `long` | `30` | 分布式锁默认租约时间（秒） |
| `sloth.redis.enable-type-info` | `boolean` | `true` | 是否携带类型信息进行 JSON 序列化 |
| `sloth.redis.null-value-expire-seconds` | `long` | `60` | 空值缓存时间（秒） |
| **多级缓存** | | | |
| `sloth.redis.multi-cache.enabled` | `boolean` | `false` | 是否启用多级缓存（Caffeine + Redis） |
| `sloth.redis.multi-cache.l1-max-size` | `int` | `1000` | L1 Caffeine 缓存最大条目数 |
| `sloth.redis.multi-cache.l1-ttl-seconds` | `long` | `300` | L1 Caffeine 缓存过期时间（秒） |
| **分布式 ID 生成器** | | | |
| `sloth.redis.id-generator.enabled` | `boolean` | `true` | 是否启用分布式 ID 生成器 |
| `sloth.redis.id-generator.worker-id` | `int` | `0` | 机器号（0-1023） |
| **布隆过滤器** | | | |
| `sloth.redis.bloom-filter.enabled` | `boolean` | `false` | 是否启用布隆过滤器 |
| `sloth.redis.bloom-filter.expected-insertions` | `long` | `1000000` | 预期插入元素数量 |
| `sloth.redis.bloom-filter.false-positive-probability` | `double` | `0.01` | 误判概率 |

## sloth.mybatis.*

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `sloth.mybatis.tenant-enabled` | `boolean` | `false` | 是否启用租户插件 |
| `sloth.mybatis.tenant-column` | `String` | `tenant_id` | 租户字段名 |
| `sloth.mybatis.tenant-ignore-tables` | `Set<String>` | `[]` | 忽略租户过滤的表 |
| `sloth.mybatis.slow-sql-threshold` | `long` | `1000` | 慢 SQL 阈值（毫秒） |
| `sloth.mybatis.tenant-auto-fill` | `boolean` | `true` | INSERT 时是否自动填充 tenantId |

## sloth.auth.*

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `sloth.auth.enabled` | `boolean` | `true` | 是否启用认证 |
| `sloth.auth.token-name` | `String` | `Authorization` | Token 名称（请求头中的 key） |
| `sloth.auth.token-timeout` | `long` | `7200` | Token 有效期（秒），默认 2 小时 |
| `sloth.auth.active-timeout` | `long` | `-1` | Token 最低活跃频率（秒），-1 表示不限 |
| `sloth.auth.is-concurrent` | `boolean` | `true` | 是否允许同一账号并发登录 |
| `sloth.auth.is-share` | `boolean` | `true` | 多人登录同一账号时是否共用同一个 Token |
| `sloth.auth.token-prefix` | `String` | `Bearer` | Token 前缀 |
| `sloth.auth.white-list` | `List<String>` | `[]` | 白名单路径（不需要认证） |
| `sloth.auth.black-list` | `List<String>` | `[]` | 黑名单路径（禁止访问） |

## sloth.ai.*

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `sloth.ai.enabled` | `boolean` | `true` | 是否启用 AI Starter |
| `sloth.ai.model` | `String` | `gpt-4o-mini` | 默认模型名称 |
| `sloth.ai.temperature` | `Double` | `0.7` | 默认温度参数 |
| `sloth.ai.top-p` | `Double` | `1.0` | 默认 topP 参数 |
| `sloth.ai.max-tokens` | `Integer` | `2048` | 默认最大输出 Token 数 |
| `sloth.ai.memory.enabled` | `boolean` | `false` | 是否启用对话记忆 |
| `sloth.ai.memory.max-messages` | `int` | `20` | 滑动窗口最大消息数 |
| `sloth.ai.embedding.enabled` | `boolean` | `true` | 是否启用向量嵌入客户端 |
| `sloth.ai.image.enabled` | `boolean` | `true` | 是否启用图像生成客户端 |
| `sloth.ai.observability.enabled` | `boolean` | `true` | 是否启用 AI 可观测性 |
| `sloth.ai.observability.slow-threshold-ms` | `long` | `3000` | 慢调用阈值（毫秒） |

## sloth.monitor.*

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `sloth.monitor.enabled` | `boolean` | `true` | 是否启用监控 Starter |
| `sloth.monitor.slow-api-enabled` | `boolean` | `true` | 是否启用慢接口监控 |
| `sloth.monitor.slow-api-threshold` | `long` | `3000` | 慢接口阈值（毫秒） |
| `sloth.monitor.alarm.enabled` | `boolean` | `false` | 是否启用告警 |
| `sloth.monitor.alarm.type` | `String` | `dingtalk` | 告警类型（dingtalk / wechat） |
| `sloth.monitor.alarm.webhook` | `String` | `null` | Webhook 地址 |
| `sloth.monitor.tracing.enabled` | `boolean` | `true` | 是否启用链路追踪 |
| `sloth.monitor.tracing.sampler-rate` | `double` | `1.0` | 链路采样率（0.0 ~ 1.0） |

## sloth.thread-pool.*

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `sloth.thread-pool.enabled` | `boolean` | `true` | 是否启用线程池 Starter |
| `sloth.thread-pool.dynamic` | `boolean` | `true` | 是否启用动态配置 |
| `sloth.thread-pool.virtual-enabled` | `boolean` | `false` | 是否启用 Java 21 虚拟线程 |
| `sloth.thread-pool.pools.<name>.core-size` | `int` | `8` | 核心线程数 |
| `sloth.thread-pool.pools.<name>.max-size` | `int` | `32` | 最大线程数 |
| `sloth.thread-pool.pools.<name>.queue-capacity` | `int` | `1024` | 队列容量 |
| `sloth.thread-pool.pools.<name>.keep-alive-time` | `int` | `60` | 空闲线程存活时间（秒） |
| `sloth.thread-pool.pools.<name>.rejected-policy` | `String` | `CALLER_RUNS` | 拒绝策略 |

## sloth.mq.* / sloth.oss.* / sloth.sms.*

| 模块 | 关键配置 |
|------|---------|
| **MQ** | `sloth.mq.idempotent-enabled=true`, `sloth.mq.max-retry=3` |
| **OSS** | `sloth.oss.type=minio`, `sloth.oss.endpoint`, `sloth.oss.access-key`, `sloth.oss.secret-key` |
| **SMS** | `sloth.sms.type=aliyun`, `sloth.sms.access-key-id`, `sloth.sms.access-key-secret`, `sloth.sms.sign-name` |

## sloth.doc.*（接口文档）

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `sloth.doc.enabled` | `boolean` | `true` | 是否启用接口文档 |
| `sloth.doc.title` | `String` | `Sloth Boot API` | 接口文档标题 |
| `sloth.doc.version` | `String` | `1.0.0` | 接口文档版本 |
| `sloth.doc.base-packages` | `List<String>` | `[com.sloth.boot]` | 扫描的基础包 |
| `sloth.doc.security-scheme-enabled` | `boolean` | `true` | 是否启用 Bearer Token 安全方案 |

## 配置示例

```yaml
sloth:
  web:
    response-wrapper: true
    xss-enabled: true

  ai:
    enabled: false
    model: gpt-4o-mini
    default-system-prompt: "你是 Sloth Boot 内置 AI 助手"

  redis:
    key-prefix: "myapp:"
    lock:
      wait-time: 3
      lease-time: 30

  thread-pool:
    enabled: true
    pools:
      default:
        core-size: 8
        max-size: 32
        queue-capacity: 1024
      scheduled:
        core-size: 4
        max-size: 4
        queue-capacity: 256

  mybatis:
    tenant-enabled: true
    tenant-column: tenant_id
    slow-sql-threshold: 2000

  auth:
    token-timeout: 7200
    white-list:
      - /api/auth/login
      - /api/auth/register
      - /doc.html
```

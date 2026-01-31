---
title: "分库分表详解"
description: "智慧书店项目技术文档 - 分库分表详解"
date: 2024-01-01
weight: 9
difficulty: 4
readTime: 35
keywords: ['分库分表', 'ShardingSphere', 'MySQL', '分片策略']
---

# 分库分表详解

> ShardingSphere配置、分片算法、绑定表

## 1. 分库分表概述

### 1.1 为什么需要分库分表
随着业务发展，单表数据量会持续增长，导致：
- 查询性能下降
- 数据库连接池耗尽
- 单机存储空间不足
- 并发能力受限

分库分表通过将数据分散到多个物理节点，解决上述问题。

### 1.2 分库分表方案对比

| 方案 | 实现方式 | 优点 | 缺点 | 适用场景 |
|------|----------|------|------|----------|
| ShardingSphere-JDBC | 客户端分片 | 无需额外部署、轻量级 | 升级困难、维护成本高 | 中小规模应用 |
| MyCat | 代理分片 | 功能强大、支持复杂路由 | 需要额外部署、性能损耗 | 大规模应用 |
| Vitess | MySQL原生改造 | 兼容性好、生态完善 | 实施复杂、成本高 | 大型互联网公司 |
| TDDL | 阿里巴巴方案 | 高性能、事务支持 | 定制化程度高 | 阿里系项目 |

**本项目选择ShardingSphere-JDBC**：客户端分片，部署简单，对业务代码侵入小。

## 2. ShardingSphere配置

### 2.1 添加依赖
```xml
<dependency>
    <groupId>org.apache.shardingsphere</groupId>
    <artifactId>shardingsphere-jdbc-core</artifactId>
    <version>5.4.1</version>
</dependency>
<dependency>
    <groupId>org.apache.shardingsphere</groupId>
    <artifactId>shardingsphere-jdbc-spring-boot-starter</artifactId>
    <version>5.4.1</version>
</dependency>
```

### 2.2 数据源配置
```yaml
# application.yml
spring:
  shardingsphere:
    enabled: true

    # 数据源配置
    datasource:
      names: ds0,ds1
      ds0:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
        jdbc-url: jdbc:mysql://localhost:3306/bookstore_order_0?useUnicode=true&characterEncoding=utf-8&useSSL=false
        username: root
        password: 123456
        hikari:
          minimum-idle: 5
          maximum-pool-size: 30
          idle-timeout: 300000
      ds1:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
        jdbc-url: jdbc:mysql://localhost:3306/bookstore_order_1?useUnicode=true&characterEncoding=utf-8&useSSL=false
        username: root
        password: 123456
        hikari:
          minimum-idle: 5
          maximum-pool-size: 30
          idle-timeout: 300000

    # 分片规则配置
    rules:
      sharding:
        # 分片算法配置
        sharding-algorithms:
          database-inline:
            type: INLINE
            props:
              algorithm-expression: ds$->{user_id % 2}
        tables:
          # 订单表分片配置
          t_order:
            actual-data-nodes: ds$->{0..1}.t_order_$->{0..3}
            table-strategy:
              standard:
                sharding-column: user_id
                sharding-algorithm-name: database-inline
            key-generate-strategy:
              column: id
              key-generator-name: snowflake
            # 绑定表配置
            binding-tables: t_order_item, t_order_status
            logic-table: t_order

            # 分表策略
            table-strategy:
              standard:
                sharding-column: user_id
                sharding-algorithm-name: table-inline
          # 订单明细表
          t_order_item:
            actual-data-nodes: ds$->{0..1}.t_order_item_$->{0..3}
            table-strategy:
              standard:
                sharding-column: user_id
                sharding-algorithm-name: table-inline
            key-generate-strategy:
              column: id
              key-generator-name: snowflake
          # 库存表分片配置
          t_inventory:
            actual-data-nodes: ds$->{0..1}.t_inventory_$->{0..1}
            database-strategy:
              standard:
                sharding-column: product_id
                sharding-algorithm-name: database-inline
            table-strategy:
              standard:
                sharding-column: product_id
                sharding-algorithm-name: table-inline
```

### 2.3 分片算法配置
```java
@Configuration
public class ShardingConfig {

    @Bean
    public KeyGenerator snowflakeKeyGenerator() {
        return new SnowflakeKeyGenerator();
    }

    @Bean
    public ShardingSphereDataSource dataSource() throws SQLException {
        // 自定义分片算法
        return ShardingDataSourceFactory.createDataSource(
            getDataSourceMap(),
                    getShardingRuleConfiguration(),
                    getProperties()
        );
    }

    private Map<String, DataSource> getDataSourceMap() {
        Map<String, DataSource> result = new HashMap<>();
        result.put("ds0", createDataSource("bookstore_order_0"));
        result.put("ds1", createDataSource("bookstore_order_1"));
        result.put("ds2", createDataSource("bookstore_inventory_0"));
        result.put("ds3", createDataSource("bookstore_inventory_1"));
        return result;
    }

    private DataSource createDataSource(String databaseName) {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:mysql://localhost:3306/" + databaseName);
        dataSource.setUsername("root");
        dataSource.setPassword("123456");
        return dataSource;
    }

    private ShardingRuleConfiguration getShardingRuleConfiguration() {
        ShardingRuleConfiguration config = new ShardingRuleConfiguration();

        // 订单分片规则
        ShardingTableRuleConfiguration orderTableRule = new ShardingTableRuleConfiguration(
                "t_order",
                "ds$->{user_id % 2}.t_order_$->{user_id % 4}");
        orderTableRule.setDatabaseShardingStrategyConfig(
                new StandardShardingStrategyConfiguration("user_id", new InlineShardingAlgorithm()));
        orderTableRule.setTableShardingStrategyConfig(
                new StandardShardingStrategyConfiguration("user_id", new InlineShardingAlgorithm()));

        // 库存分片规则
        ShardingTableRuleConfiguration inventoryTableRule = new ShardingTableRuleConfiguration(
                "t_inventory",
                "ds$->{product_id % 2}.t_inventory_$->{product_id % 2}");
        inventoryTableRule.setDatabaseShardingStrategyConfig(
                new StandardShardingStrategyConfiguration("product_id", new InlineShardingAlgorithm()));

        config.getTables().add(orderTableRule);
        config.getTables().add(inventoryTableRule);

        // 绑定表配置
        config.getBindingTableGroups().add("order_binding_group");

        return config;
    }
}
```

## 3. 分片策略详解

### 3.1 分片键选择
```
订单表：user_id
- 用户查询自己的订单，访问固定分片
- 跨用户查询需要联合查询
- 符合80/20原则

库存表：product_id
- 商品库存操作集中在同一分片
- 秒杀时热点数据在同一分片
- 减少跨分片操作
```

### 3.2 分片算法实现
```java
// 内联分片算法
public class InlineShardingAlgorithm implements StandardShardingAlgorithm<Long> {

    @Override
    public String doSharding(Collection<String> availableTargetNames, PreciseShardingValue<Long> shardingValue) {
        String logicTableName = shardingValue.getLogicTableName();
        Long shardingValueValue = shardingValue.getValue();

        if (logicTableName.equals("t_order")) {
            return "ds" + (shardingValueValue % 2);
        } else if (logicTableName.equals("t_inventory")) {
            return "ds" + (shardingValueValue % 2);
        }

        throw new IllegalArgumentException("未知的分片表: " + logicTableName);
    }

    @Override
    public Collection<String> doSharding(Collection<String> availableTargetNames, RangeShardingValue<Long> shardingValue) {
        // 范围查询的分片处理
        return availableTargetNames;
    }
}

// 自定义分片算法
public class CustomShardingAlgorithm implements StandardShardingAlgorithm<String> {

    private final Map<String, Integer> userToDatabase = new HashMap<>();

    @Override
    public String doSharding(Collection<String> availableTargetNames, PreciseShardingValue<String> shardingValue) {
        String userId = shardingValue.getValue();

        // 使用一致性哈希
        ConsistentHash consistentHash = new ConsistentHash(availableTargetNames);
        return consistentHash.getNode(userId);
    }
}
```

### 3.3 绑定表配置
```java
// 绑定表配置（订单相关表在同一分片）
@ShardingBindingTable(tableName = "t_order")
public class OrderBindingTable {

    public String getSharding(String orderId, Long userId) {
        // 订单表和明细表必须在同一分片
        return "ds" + (userId % 2) + ".t_order_" + (userId % 4);
    }
}

// 使用绑定表的优势
// 1. 跨表查询性能高
// 2. 支持JOIN操作
// 3. 保证数据一致性
```

## 4. 数据操作示例

### 4.1 插入操作
```java
@Service
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private OrderItemMapper orderItemMapper;

    @Transactional
    public void createOrder(Order order, List<OrderItem> items) {
        // 插入订单
        orderMapper.insert(order);

        // 插入订单明细（自动路由到同一分片）
        for (OrderItem item : items) {
            item.setOrderId(order.getId());
            orderItemMapper.insert(item);
        }
    }
}
```

### 4.2 查询操作
```java
@Service
public class OrderQueryService {

    @Autowired
    private OrderMapper orderMapper;

    // 按ID查询（自动路由）
    public Order getOrderById(Long orderId) {
        return orderMapper.selectById(orderId);
    }

    // 按用户ID查询（自动路由到用户分片）
    public List<Order> getOrdersByUserId(Long userId) {
        return orderMapper.selectByUserId(userId);
    }

    // 跨分片查询（需要特殊处理）
    public List<Order> getOrdersByProductIds(List<Long> productIds) {
        return orderMapper.selectByProductIds(productIds);
    }
}
```

### 4.3 更新操作
```java
@Service
public class OrderUpdateService {

    @Autowired
    private OrderMapper orderMapper;

    @Transactional
    public void updateOrderStatus(Long orderId, Integer status) {
        Order order = new Order();
        order.setId(orderId);
        order.setStatus(status);
        orderMapper.updateById(order);
    }
}
```

## 5. 分库分表注意事项

### 5.1 事务处理
```java
// 全局事务（Seata）
@GlobalTransactional
public void createOrderWithInventory(Order order, List<OrderItem> items) {
    createOrder(order, items);
    inventoryService.deductInventory(items);
}

// 本地事务（单个分片）
@Transactional
public void updateOrderStatus(Long orderId, Integer status) {
    orderMapper.updateStatus(orderId, status);
}
```

### 5.2 跨分片查询
```java
// 方案1：多次查询
public List<Order> getOrdersByUserIds(List<Long> userIds) {
    List<Order> result = new ArrayList<>();
    for (Long userId : userIds) {
        List<Order> orders = orderMapper.selectByUserId(userId);
        result.addAll(orders);
    }
    return result;
}

// 方案2：使用IN查询（ShardingSphere自动处理）
@Select("SELECT * FROM t_order WHERE user_id IN (${userIds})")
List<Order> selectByUserIds(@Param("userIds") Collection<Long> userIds);
```

### 5.3 主键生成
```java
// 雪花算法生成全局ID
@Component
public class SnowflakeKeyGenerator {

    private final long twepoch = 1288834974657L;
    private final long sequenceBits = 12L;
    private final long workerIdBits = 5L;
    private final long datacenterIdBits = 5L;

    private final long maxWorkerId = -1L ^ (-1L << workerIdBits);
    private final long maxDatacenterId = -1L ^ (-1L << datacenterIdBits);

    private final long sequenceMask = -1L ^ (-1L << sequenceBits);

    private long workerId;
    private long datacenterId;
    private long sequence = 0L;
    private long lastTimestamp = -1L;

    public SnowflakeKeyGenerator() {
        this.workerId = 1L;
        this.datacenterId = 1L;
    }

    public synchronized long nextId() {
        long timestamp = timeGen();

        if (timestamp < lastTimestamp) {
            throw new RuntimeException("时钟回拨");
        }

        if (lastTimestamp == timestamp) {
            sequence = (sequence + 1) & sequenceMask;
            if (sequence == 0) {
                timestamp = tilNextMillis(lastTimestamp);
            }
        } else {
            sequence = 0L;
        }

        lastTimestamp = timestamp;

        return ((timestamp - twepoch) << (workerIdBits + datacenterIdBits + sequenceBits))
                | (datacenterId << (workerIdBits + sequenceBits))
                | (workerId << sequenceBits)
                | sequence;
    }

    private long tilNextMillis(long lastTimestamp) {
        long timestamp = timeGen();
        while (timestamp <= lastTimestamp) {
            timestamp = timeGen();
        }
        return timestamp;
    }

    private long timeGen() {
        return System.currentTimeMillis();
    }
}
```

## 6. 性能优化

### 6.1 索引优化
```sql
-- 订单表索引
CREATE INDEX idx_order_user_status ON t_order(user_id, status);
CREATE INDEX idx_order_create_time ON t_order(create_time);

-- 库存表索引
CREATE INDEX idx_inventory_product ON t_inventory(product_id);
CREATE INDEX idx_inventory_available ON t_inventory(available_stock);
```

### 6.2 查询优化
```java
// 避免 SELECT *
@Select("SELECT id, order_no, user_id, total_amount FROM t_order WHERE user_id = #{userId}")
List<Order> selectByUserId(Long userId);

// 使用分页
@Select("SELECT * FROM t_order WHERE user_id = #{userId} LIMIT #{offset}, #{limit}")
List<Order> selectByUserIdPage(@Param("userId") Long userId,
                              @Param("offset") int offset,
                              @Param("limit") int limit);
```

### 6.3 连接池调优
```yaml
spring:
  shardingsphere:
    datasource:
      ds0:
        hikari:
          maximum-pool-size: 30  # 根据服务器配置调整
          minimum-idle: 5
          connection-timeout: 30000
          idle-timeout: 600000
          max-lifetime: 1800000
          leak-detection-threshold: 15000
```

## 7. 监控和运维

### 7.1 监控指标
```java
@Component
public class ShardingMonitor {

    @Autowired
    private DataSource dataSource;

    public Map<String, Object> getMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // 获取数据源信息
        if (dataSource instanceof ShardingSphereDataSource) {
            ShardingSphereDataSource shardingDataSource = (ShardingSphereDataSource) dataSource;
            Map<String, DataSource> dataSourceMap = shardingDataSource.getDataSourceMap();

            metrics.put("data_source_count", dataSourceMap.size());
            metrics.put("active_connections", getActiveConnections());
            metrics.put("query_count", getQueryCount());
        }

        return metrics;
    }

    private int getActiveConnections() {
        // 实现连接数统计
        return 0;
    }

    private long getQueryCount() {
        // 实现查询次数统计
        return 0;
    }
}
```

### 7.2 数据迁移
```bash
# 数据迁移脚本示例
#!/bin/bash

# 导出源数据
mysqldump -h localhost -u root -p bookstore_order t_order > order_backup.sql

# 修改SQL中的数据库名
sed 's/bookstore_order_0/bookstore_order_new_0/g' order_backup.sql > order_new.sql

# 导入到新库
mysql -h localhost -u root -p bookstore_order_new < order_new.sql

# 验证数据
mysql -h localhost -u root -p -e "SELECT COUNT(*) FROM bookstore_order_new_0.t_order"
```

## 8. 最佳实践

### 8.1 设计原则
1. **分片键选择**：选择查询频繁、分布均匀的字段
2. **分片数量**：避免过多分片，增加管理复杂度
3. **分片粒度**：根据业务规模选择合适的粒度
4. **命名规范**：清晰的命名便于维护

### 8.2 运维建议
1. **分片扩容**：预留分片扩容方案
2. **数据备份**：实施定期备份策略
3. **性能监控**：建立完善的监控体系
4. **应急方案**：制定故障处理流程

### 8.3 常见问题
1. **跨分片查询性能差**：优化查询语句，使用缓存
2. **分片不均匀**：选择合适的分片算法
3. **事务问题**：正确使用分布式事务
4. **连接池耗尽**：调整连接池配置

---

[返回文档首页](../README.md) | [上一篇：分布式事务详解](./distributed-transaction.md) | [下一篇：消息队列详解](./message-queue.md)

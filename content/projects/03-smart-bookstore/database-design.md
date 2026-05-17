# 数据库设计

## 1. 分片策略

| 数据库 | 分片键 | 分片数量 | 说明 |
|--------|--------|----------|------|
| 用户库 | - | 1 | 用户数据相对稳定，不分片 |
| 商品库 | - | 1 | 商品数据查询频繁，但写入少 |
| 订单库 | user_id % 2 | 2 | 按用户 ID 分片，用户查询自己的订单高效 |
| 库存库 | product_id % 2 | 2 | 按商品 ID 分片，商品库存操作在同一分片 |

## 2. 库表结构

```
bookstore_user (单库)
├── t_user                    # 用户表
└── t_user_profile            # 用户扩展表

bookstore_product (单库)
├── t_product                 # 商品表
├── t_product_sku             # 商品SKU表
├── t_seckill_activity        # 秒杀活动表
├── t_seckill_product         # 秒杀商品表
└── t_category                # 商品分类表

bookstore_order_0 / bookstore_order_1 (分库)
├── t_order                   # 订单主表
├── t_order_item              # 订单明细表
├── t_order_status            # 订单状态表
└── undo_log                  # Seata事务回滚日志

bookstore_inventory_0 / bookstore_inventory_1 (分库)
├── t_inventory               # 库存表
├── t_inventory_water         # 库存流水表
└── undo_log                  # Seata事务回滚日志
```

## 3. 核心表设计

### 用户表 (t_user)

```sql
CREATE TABLE t_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    update_time DATETIME NOT NULL COMMENT '更新时间',
    UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 秒杀活动表 (t_seckill_activity)

```sql
CREATE TABLE t_seckill_activity (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '活动ID',
    activity_no VARCHAR(32) NOT NULL COMMENT '活动编号',
    name VARCHAR(100) NOT NULL COMMENT '活动名称',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    total_stock INT NOT NULL COMMENT '总库存',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    update_time DATETIME NOT NULL COMMENT '更新时间',
    INDEX idx_time_range (start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='秒杀活动表';
```

### 订单主表 (t_order) — 分片表

```sql
CREATE TABLE t_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    order_no VARCHAR(32) NOT NULL COMMENT '订单编号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '总金额',
    pay_amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待支付，1-已支付，2-已发货，3-已完成，4-已取消',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    update_time DATETIME NOT NULL COMMENT '更新时间',
    UNIQUE KEY uk_order_no (order_no),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';
```

### 库存表 (t_inventory) — 分片表

```sql
CREATE TABLE t_inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '库存ID',
    product_id BIGINT NOT NULL COMMENT '商品ID',
    total_stock INT NOT NULL COMMENT '总库存',
    available_stock INT NOT NULL COMMENT '可用库存',
    version INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    update_time DATETIME NOT NULL COMMENT '更新时间',
    UNIQUE KEY uk_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存表';
```

## 4. ShardingSphere 分片配置

```yaml
rules:
  sharding:
    tables:
      t_order:
        actual-data-nodes: ds$->{0..1}.t_order_$->{0..3}
        database-strategy:
          standard:
            sharding-column: user_id
            sharding-algorithm-name: database-inline
        table-strategy:
          standard:
            sharding-column: user_id
            sharding-algorithm-name: table-inline
      t_inventory:
        actual-data-nodes: ds$->{0..1}.t_inventory
        database-strategy:
          standard:
            sharding-column: product_id
            sharding-algorithm-name: database-inline
```

分片效果：
```
user_id=1  ──►  ds1.t_order_1
user_id=2  ──►  ds0.t_order_2
user_id=3  ──►  ds1.t_order_3
user_id=4  ──►  ds0.t_order_0
```

## 5. Redis 缓存设计

```
商品信息      Key: product:{id}              Type: Hash     TTL: 1小时
秒杀活动      Key: seckill:activity:{id}     Type: Hash     TTL: 30分钟
库存缓存      Key: seckill:stock:{pid}       Type: String   TTL: 活动结束后
售罄标记      Key: seckill:soldout:{pid}     Type: String   TTL: 1天
用户已购      Key: seckill:bought:{aid}:{uid} Type: Set     TTL: 24小时
```

### 库存预减 Lua 脚本

```lua
local stockKey = KEYS[1]
local soldOutKey = KEYS[2]
local quantity = tonumber(ARGV[1])

if redis.call('EXISTS', soldOutKey) == 1 then
    return -2  -- 已售罄
end

local currentStock = tonumber(redis.call('GET', stockKey) or 0)
if currentStock < quantity then
    redis.call('SET', soldOutKey, '1', 'EX', 86400)
    return -1  -- 库存不足
end

redis.call('DECRBY', stockKey, quantity)
return 1  -- 成功
```

## 6. Seata 事务表

每个分库都需要创建 undo_log 表：

```sql
CREATE TABLE undo_log (
    branch_id     BIGINT       NOT NULL COMMENT '分支事务ID',
    xid           VARCHAR(128) NOT NULL COMMENT '全局事务ID',
    context       VARCHAR(128) NOT NULL COMMENT '上下文',
    rollback_info LONGBLOB     NOT NULL COMMENT '回滚信息',
    log_status    INT          NOT NULL COMMENT '状态',
    log_created   DATETIME     NOT NULL COMMENT '创建时间',
    log_modified  DATETIME     NOT NULL COMMENT '修改时间',
    PRIMARY KEY (branch_id),
    UNIQUE KEY ux_undo_log (xid, branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Seata回滚日志表';
```

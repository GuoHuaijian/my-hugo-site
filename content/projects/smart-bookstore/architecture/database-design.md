---
title: "数据库设计"
description: "智慧书店项目技术文档 - 数据库设计"
date: 2024-01-01
weight: 3
difficulty: 3
readTime: 35
keywords: ['数据库', '分库分表', '索引设计', 'MySQL']
---

# 数据库设计

## 1. 数据库架构概览

### 1.1 分片策略
本项目采用分库分表策略，将数据分散到多个物理数据库中，提高并发处理能力。

| 数据库 | 分片键 | 分片数量 | 说明 |
|--------|--------|----------|------|
| 用户库 | - | 1 | 用户数据相对稳定，不分片 |
| 商品库 | - | 1 | 商品数据查询频繁，但写入少 |
| 订单库 | user_id % 2 | 2 | 按用户ID分片，用户查询自己的订单高效 |
| 库存库 | product_id % 2 | 2 | 按商品ID分片，商品库存操作在同一分片 |

### 1.2 库表结构图
```
bookstore_user (单库)
├── t_user                    # 用户表
└── t_user_profile            # 用户扩展表

bookstore_product (单库)
├── t_product                 # 商品表
├── t_product_sku             # 商品SKU表
├── t_seckill_activity       # 秒杀活动表
├── t_seckill_product        # 秒杀商品表
└── t_category               # 商品分类表

bookstore_order_0 / bookstore_order_1 (分库)
├── t_order                  # 订单主表
├── t_order_item             # 订单明细表
├── t_order_status           # 订单状态表
└── undo_log                 # Seata事务回滚日志

bookstore_inventory_0 / bookstore_inventory_1 (分库)
├── t_inventory              # 库存表
├── t_inventory_water        # 库存流水表
└── undo_log                # Seata事务回滚日志
```

## 2. 用户库设计

### 2.1 用户表 (t_user)
```sql
CREATE TABLE t_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    user_no VARCHAR(32) NOT NULL COMMENT '用户编号',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    update_time DATETIME NOT NULL COMMENT '更新时间',
    UNIQUE KEY uk_user_no (user_no),
    UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 2.2 用户扩展表 (t_user_profile)
```sql
CREATE TABLE t_user_profile (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    real_name VARCHAR(50) COMMENT '真实姓名',
    avatar VARCHAR(255) COMMENT '头像',
    gender TINYINT COMMENT '性别：0-未知，1-男，2-女',
    birthday DATE COMMENT '生日',
    address TEXT COMMENT '地址',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    update_time DATETIME NOT NULL COMMENT '更新时间',
    UNIQUE KEY uk_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES t_user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户扩展表';
```

## 3. 商品库设计

### 3.1 商品表 (t_product)
```sql
CREATE TABLE t_product (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
    product_no VARCHAR(32) NOT NULL COMMENT '商品编号',
    name VARCHAR(100) NOT NULL COMMENT '商品名称',
    description TEXT COMMENT '商品描述',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    image VARCHAR(255) COMMENT '主图',
    stock INT NOT NULL DEFAULT 0 COMMENT '总库存',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-下架，1-上架',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    update_time DATETIME NOT NULL COMMENT '更新时间',
    UNIQUE KEY uk_product_no (product_no),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';
```

### 3.2 秒杀活动表 (t_seckill_activity)
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
    UNIQUE KEY uk_activity_no (activity_no),
    INDEX idx_time_range (start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='秒杀活动表';
```

### 3.3 秒杀商品表 (t_seckill_product)
```sql
CREATE TABLE t_seckill_product (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    activity_id BIGINT NOT NULL COMMENT '活动ID',
    product_id BIGINT NOT NULL COMMENT '商品ID',
    seckill_price DECIMAL(10,2) NOT NULL COMMENT '秒杀价格',
    seckill_stock INT NOT NULL COMMENT '秒杀库存',
    limit_per_user INT NOT NULL DEFAULT 1 COMMENT '每人限购数',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    update_time DATETIME NOT NULL COMMENT '更新时间',
    UNIQUE KEY uk_activity_product (activity_id, product_id),
    INDEX idx_product_id (product_id),
    FOREIGN KEY (activity_id) REFERENCES t_seckill_activity(id),
    FOREIGN KEY (product_id) REFERENCES t_product(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='秒杀商品表';
```

## 4. 订单库设计

### 4.1 订单主表 (t_order)
```sql
CREATE TABLE t_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    order_no VARCHAR(32) NOT NULL COMMENT '订单编号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '总金额',
    pay_amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '优惠金额',
    shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '运费',
    payment_method TINYINT COMMENT '支付方式：1-微信，2-支付宝',
    payment_time DATETIME COMMENT '支付时间',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待支付，1-已支付，2-已发货，3-已完成，4-已取消',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    update_time DATETIME NOT NULL COMMENT '更新时间',
    UNIQUE KEY uk_order_no (order_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';
```

### 4.2 订单明细表 (t_order_item)
```sql
CREATE TABLE t_order_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '明细ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    product_id BIGINT NOT NULL COMMENT '商品ID',
    product_name VARCHAR(100) NOT NULL COMMENT '商品名称',
    product_image VARCHAR(255) COMMENT '商品图片',
    quantity INT NOT NULL COMMENT '购买数量',
    price DECIMAL(10,2) NOT NULL COMMENT '商品单价',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '总金额',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    FOREIGN KEY (order_id) REFERENCES t_order(id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';
```

### 4.3 订单状态表 (t_order_status)
```sql
CREATE TABLE t_order_status (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    status TINYINT NOT NULL COMMENT '状态',
    remark VARCHAR(255) COMMENT '备注',
    operator VARCHAR(50) COMMENT '操作人',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    FOREIGN KEY (order_id) REFERENCES t_order(id),
    INDEX idx_order_id (order_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单状态变更记录';
```

## 5. 库存库设计

### 5.1 库存表 (t_inventory)
```sql
CREATE TABLE t_inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '库存ID',
    product_id BIGINT NOT NULL COMMENT '商品ID',
    total_stock INT NOT NULL COMMENT '总库存',
    available_stock INT NOT NULL COMMENT '可用库存',
    sold_stock INT NOT NULL DEFAULT 0 COMMENT '已售库存',
    version INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    update_time DATETIME NOT NULL COMMENT '更新时间',
    UNIQUE KEY uk_product_id (product_id),
    INDEX idx_available_stock (available_stock),
    INDEX idx_version (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存表';
```

### 5.2 库存流水表 (t_inventory_water)
```sql
CREATE TABLE t_inventory_water (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '流水ID',
    product_id BIGINT NOT NULL COMMENT '商品ID',
    order_no VARCHAR(32) COMMENT '订单号',
    change_type TINYINT NOT NULL COMMENT '变更类型：1-增加，2-减少',
    quantity INT NOT NULL COMMENT '变更数量',
    before_stock INT NOT NULL COMMENT '变更前库存',
    after_stock INT NOT NULL COMMENT '变更后库存',
    remark VARCHAR(255) COMMENT '备注',
    create_time DATETIME NOT NULL COMMENT '创建时间',
    INDEX idx_product_id (product_id),
    INDEX idx_create_time (create_time),
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存流水表';
```

## 6. Seata事务表

### 6.1 undo_log表（每个分库都需要）
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

## 7. Redis缓存设计

### 7.1 缓存策略
```
商品信息缓存
Key: product:{id}
Type: Hash
TTL: 1小时

秒杀活动缓存
Key: seckill:activity:{id}
Type: Hash
TTL: 30分钟

库存缓存
Key: seckill:stock:{product_id}
Type: String
TTL: 活动结束后

售罄标记
Key: seckill:soldout:{product_id}
Type: String
TTL: 1天

用户已购标记
Key: seckill:bought:{activity_id}:{user_id}
Type: Set
TTL: 24小时
```

### 7.2 Lua脚本缓存
```lua
-- seckill_stock.lua
local stockKey = KEYS[1]
local soldOutKey = KEYS[2]
local quantity = tonumber(ARGV[1])

-- 检查售罄标记
if redis.call('EXISTS', soldOutKey) == 1 then
    return -2
end

-- 获取当前库存
local currentStock = tonumber(redis.call('GET', stockKey) or 0)

-- 判断库存
if currentStock < quantity then
    redis.call('SET', soldOutKey, '1', 'EX', 86400)
    return -1
end

-- 扣减库存
redis.call('DECRBY', stockKey, quantity)
return 1
```

## 8. 数据库索引优化

### 8.1 查询优化原则
- 合理使用覆盖索引，避免回表
- 大字段（如TEXT）不要建立索引
- 定期分析慢查询，优化SQL

### 8.2 关键索引
```sql
-- 用户相关
INDEX idx_user_username (t_user.username)
INDEX idx_user_status (t_user.status)

-- 商品相关
INDEX idx_product_status (t_product.status)
INDEX idx_seckill_product_activity (t_seckill_product.activity_id)
INDEX idx_seckill_product_stock (t_seckill_product.seckill_stock)

-- 订单相关
INDEX idx_order_user (t_order.user_id)
INDEX idx_order_status (t_order.status)
INDEX idx_order_time (t_order.create_time)

-- 库存相关
INDEX idx_inventory_product (t_inventory.product_id)
INDEX idx_inventory_available (t_inventory.available_stock)
```

## 9. 数据备份与恢复

### 9.1 备份策略
- 全量备份：每天凌晨2点
- 增量备份：每小时一次
- 二进制日志：实时备份

### 9.2 恢复流程
1. 停止MySQL服务
2. 恢复全量备份
3. 应用增量备份
4. 应用二进制日志
5. 启动服务验证

---

[返回文档首页](../README.md)

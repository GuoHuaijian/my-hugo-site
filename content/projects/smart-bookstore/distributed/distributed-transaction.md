---
title: "分布式事务详解"
description: "智慧书店项目技术文档 - 分布式事务详解"
date: 2024-01-01
weight: 8
difficulty: 5
readTime: 45
keywords: ['分布式事务', 'Seata', 'TCC', 'AT模式']
---

# 分布式事务详解

> 本文深入讲解项目中Seata AT模式的原理与实践

## 1. 为什么需要分布式事务

### 1.1 问题场景
秒杀下单场景：
```
┌─────────────┐ ┌─────────────┐
│ 订单服务     │ │ 库存服务     │
│ 创建订单     │ │ 扣减库存     │
│ (order_db)  │ │(inventory_db)│
└──────┬──────┘ └──────┬──────┘
       │               │
       ▼               ▼
订单创建成功     库存扣减失败
       │               │
└───── 数据不一致! ────┘
```

**问题**：两个服务操作不同数据库，如何保证要么都成功，要么都失败？

### 1.2 解决方案对比

| 方案 | 一致性 | 性能 | 侵入性 | 适用场景 |
|-----|-------|-----|--------|---------|
| 2PC/XA | 强一致 | 低 | 低 | 传统企业应用 |
| TCC | 强一致 | 中 | 高 | 资金类业务 |
| **Seata AT** | 强一致 | 中高 | 低 | 通用场景 ✓ |
| 本地消息表 | 最终一致 | 高 | 中 | 跨系统集成 |
| 事务消息 | 最终一致 | 高 | 中 | 异步场景 |

**本项目选择Seata AT的原因**：
- 对业务代码侵入小（只需一个注解）
- 性能相对较好
- 自动补偿，无需手写逆向SQL

## 2. Seata AT模式原理

### 2.1 核心角色
```
┌─────────────────────────────────────────────────────────────────────┐
│ Seata 架构                                                            │
├─────────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────────────────────────────────────────────────────┐       │
│ │ TC (Transaction Coordinator)                               │       │
│ │ 事务协调器                                                  │       │
│ │ Seata Server                                               │       │
│ │                                                           │       │
│ │ - 维护全局事务和分支事务的状态                              │       │
│ │ - 驱动全局事务提交或回滚                                    │       │
│ └─────────────────────────────────────────────────────────────┘       │
│ ▲ ▲                                                                       │
│ │ 注册/上报 │ 注册/上报                                                   │
│ │           │                                                           │
│ ┌────────┴────────┐ ┌───────┴─────────┐                                   │
│ │ TM (Transaction │ │ RM (Resource   │                                   │
│ │ Manager)       │ │ Manager)       │                                   │
│ │ 事务管理器       │ │ 资源管理器       │                                   │
│ │                 │ │                │                                   │
│ │ @GlobalTransac-│ │ 每个数据库连接   │                                   │
│ │ tional 标注的   │ │ 的代理           │                                   │
│ │ 方法入口        │ │                 │                                   │
│ └─────────────────┘ └─────────────────┘                                   │
│ │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 执行流程
```
┌─────────────────────────────────────────────────────────────────────────┐
│ AT模式两阶段提交                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ │
│ ================== 第一阶段：业务SQL执行 ==================                 │
│ │
│ ┌─────────────────────────────────────────────────────────────────┐     │
│ │ 1. TM 向 TC 申请开启全局事务                                     │     │
│ │ TC 返回全局事务ID (XID): 192.168.1.1:8091:12345678              │     │
│ └─────────────────────────────────────────────────────────────────┘     │
│ │ │
│ ▼                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐     │
│ │ 2. RM 拦截业务SQL，解析得到：                                   │     │
│ │ - 表名：t_order                                                  │     │
│ │ - 操作：INSERT                                                  │     │
│ │ - 主键：id=123456                                                │     │
│ └─────────────────────────────────────────────────────────────────┘     │
│ │ │
│ ▼                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐     │
│ │ 3. 执行前：查询前置镜像 (Before Image)                          │     │
│ │ SELECT * FROM t_order WHERE id = 123456                         │     │
│ │ → 结果为空（INSERT场景）                                         │     │
│ └─────────────────────────────────────────────────────────────────┘     │
│ │ │
│ ▼                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐     │
│ │ 4. 执行业务SQL                                                  │     │
│ │ INSERT INTO t_order (...) VALUES (...)                           │     │
│ └─────────────────────────────────────────────────────────────────┘     │
│ │ │
│ ▼                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐     │
│ │ 5. 执行后：查询后置镜像 (After Image)                           │     │
│ │ SELECT * FROM t_order WHERE id = 123456                         │     │
│ │ → 获取新插入的数据                                               │     │
│ └─────────────────────────────────────────────────────────────────┘     │
│ │ │
│ ▼                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐     │
│ │ 6. 生成回滚日志 (undo_log)                                      │     │
│ │ {                                                               │     │
│ │ "branchId": 12345,                                             │     │
│ │ "xid": "192.168.1.1:8091:12345678",                            │     │
│ │ "beforeImage": null,                                            │     │
│ │ "afterImage": {"id":123456, "orderNo":"xxx", ...}              │     │
│ │ }                                                               │     │
│ └─────────────────────────────────────────────────────────────────┘     │
│ │ │
│ ▼                                                                         │
│ ┌─────────────────────────────────────────────────────────────────┐     │
│ │ 7. 本地事务提交（业务SQL + undo_log 一起提交）                   │     │
│ │ 8. RM 向 TC 上报分支状态：Phase1_Done                           │     │
│ └─────────────────────────────────────────────────────────────────┘     │
│ │
│ ================== 第二阶段：全局提交/回滚 ==================                 │
│ │
│ ┌─────────────────────────────────────────────────────────────────┐     │
│ │ 情况A：所有分支都成功 → 全局提交                                   │     │
│ │ - TC 通知所有 RM 提交                                             │     │
│ │ - RM 异步删除 undo_log（数据已经生效，无需回滚）                   │     │
│ │ - 第二阶段几乎无耗时                                               │     │
│ └─────────────────────────────────────────────────────────────────┘     │
│ │
│ ┌─────────────────────────────────────────────────────────────────┐     │
│ │ 情况B：某分支失败 → 全局回滚                                       │     │
│ │ - TC 通知所有 RM 回滚                                             │     │
│ │ - RM 读取 undo_log，执行逆向SQL                                   │     │
│ │ INSERT → DELETE WHERE id = 123456                               │     │
│ │ UPDATE → UPDATE SET ... (恢复为beforeImage)                       │     │
│ │ DELETE → INSERT (重新插入beforeImage)                            │     │
│ │ - 删除 undo_log                                                   │     │
│ └─────────────────────────────────────────────────────────────────┘     │
│ │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. 项目实战

### 3.1 依赖配置
```xml
<!-- pom.xml -->
<dependency>
    <groupId>io.seata</groupId>
    <artifactId>seata-spring-boot-starter</artifactId>
    <version>1.7.0</version>
</dependency>
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-seata</artifactId>
</dependency>
```

### 3.2 Seata配置
```yaml
# application.yml
seata:
  enabled: true
  application-id: bookstore-order-service
  tx-service-group: bookstore_tx_group

  config:
    type: nacos
    nacos:
      server-addr: localhost:8848
      namespace: bookstore-dev
      group: SEATA_GROUP
      data-id: seataServer.properties

  registry:
    type: nacos
    nacos:
      server-addr: localhost:8848
      namespace: bookstore-dev
      application: seata-server

  service:
    vgroup-mapping:
      bookstore_tx_group: default
```

### 3.3 undo_log表
```sql
-- 每个分片数据库都需要创建
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3.4 业务代码
```java
// OrderDomainService.java

/**
 * 创建秒杀订单（分布式事务）
 */
@GlobalTransactional(
    name = "seckill-create-order",
    rollbackFor = Exception.class,
    timeoutMills = 30000
)
public OrderDTO createSeckillOrder(CreateOrderRequest request) {
    log.info("开始创建秒杀订单, XID: {}", RootContext.getXID());

    // ========== 分支事务1：创建订单 ==========
    Order order = buildOrder(request);
    orderMapper.insert(order);
    log.info("订单创建完成: orderNo={}", order.getOrderNo());

    OrderItem item = buildOrderItem(order, request);
    orderItemMapper.insert(item);
    log.info("订单明细创建完成");

    // ========== 分支事务2：扣减库存（Dubbo远程调用） ==========
    DeductStockRequest stockRequest = new DeductStockRequest();
    stockRequest.setProductId(request.getProductId());
    stockRequest.setQuantity(request.getQuantity());
    stockRequest.setOrderNo(order.getOrderNo());

    Result<Boolean> stockResult = inventoryService.deductStock(stockRequest);

    if (!stockResult.isSuccess() || !Boolean.TRUE.equals(stockResult.getData())) {
        // 抛出异常，触发全局回滚
        throw new BusinessException("STOCK_DEDUCT_FAIL",
                stockResult.getMessage());
    }
    log.info("库存扣减完成");

    // 全部成功，返回结果
    return toDTO(order);
}
```

### 3.5 XID透传
Dubbo调用时，Seata会自动透传XID：

```java
// Seata Dubbo Filter（自动配置）
public class SeataTransactionPropagationFilter implements Filter {
    @Override
    public Result invoke(Invoker<?> invoker, Invocation invocation) {
        String xid = RootContext.getXID();
        if (xid != null) {
            // 将XID放入RPC上下文
            RpcContext.getContext().setAttachment(RootContext.KEY_XID, xid);
        }
        return invoker.invoke(invocation);
    }
}
```

## 4. 常见问题

### 4.1 脏读问题
**问题**：分支事务一阶段提交后，数据已可见，但全局事务可能回滚。

**解决方案**：Seata通过全局锁解决
```sql
-- 执行业务SQL前，先获取全局锁
SELECT FOR UPDATE ...

-- 如果其他事务持有该行的全局锁，等待或超时
```

### 4.2 回滚失败
**问题**：undo_log回放时，数据已被其他事务修改。

**解决方案**：
- Seata会进行脏数据校验
- 校验失败会告警，需人工介入
- 业务设计上尽量避免并发修改

### 4.3 性能优化

| 优化点 | 措施 |
|--------|------|
| 减少事务时间 | 事务内避免RPC调用多个服务 |
| 异步提交 | 二阶段提交异步执行 |
| 批量操作 | 合并多个分支事务 |

## 5. 面试要点

### 5.1 必问问题
**Q：Seata AT模式的原理？**

A：AT模式是一种两阶段提交协议。第一阶段执行业务SQL，同时记录undo_log，并提交本地事务；第二阶段根据全局事务结果，成功则异步删除undo_log，失败则通过undo_log回滚数据。

**Q：为什么选择AT模式而不是TCC？**

A：AT模式对业务侵入小，只需一个注解；TCC需要编写Try/Confirm/Cancel三个方法。我们的场景是通用的CRUD操作，AT模式足够满足需求。

**Q：如何保证undo_log和业务数据的一致性？**

A：undo_log和业务数据在同一个本地事务中提交，要么都成功，要么都失败。

### 5.2 加分回答
- "我们使用Nacos作为Seata的注册中心和配置中心，便于统一管理"
- "事务超时时间设置为30秒，避免长事务占用资源"
- "每个分片库都创建了undo_log表，支持分库分表场景"

---

[返回文档首页](../README.md) | [上一篇：分布式锁详解](./distributed-lock.md) | [下一篇：分库分表详解](./sharding.md)

# 订单流程详解

> 订单创建、支付、取消的状态流转

## 1. 订单生命周期

```
用户下单 → 支付订单 → 发货订单 → 完成订单
    ↓           ↓           ↓           ↓
   待支付       已支付       已发货       已完成
    ↓           ↓
   取消订单     超时取消
```

## 2. 订单状态设计

```java
public enum OrderStatus {
    PENDING_PAYMENT(0, "待支付"),
    PAID(1, "已支付"),
    SHIPPED(2, "已发货"),
    COMPLETED(3, "已完成"),
    CANCELLED(4, "已取消"),
    REFUNDING(5, "退款中"),
    REFUNDED(6, "已退款"),
    TIMEOUT(7, "已超时");
}
```

### 状态流转规则

| 当前状态 | 可转状态 | 触发条件 |
|---------|---------|----------|
| PENDING_PAYMENT | PAID / CANCELLED / TIMEOUT | 支付成功 / 用户取消 / 超时 |
| PAID | SHIPPED / REFUNDING | 发货成功 / 申请退款 |
| SHIPPED | COMPLETED / REFUNDING | 确认收货 / 申请退款 |
| COMPLETED | REFUNDING | 申请退款 |
| CANCELLED / REFUNDED / TIMEOUT | - | 终态 |

## 3. 状态机实现

```java
@Component
public class OrderStateMachine {

    public OrderStatus transform(Order order, OrderEvent event) {
        OrderStatus currentStatus = order.getStatus();
        switch (currentStatus) {
            case PENDING_PAYMENT:
                return handlePendingPayment(event);
            case PAID:
                return handlePaid(event);
            case SHIPPED:
                return handleShipped(event);
            case COMPLETED:
                return handleCompleted(event);
            default:
                return currentStatus; // 终态不可转换
        }
    }

    private OrderStatus handlePendingPayment(OrderEvent event) {
        return switch (event) {
            case PAY_SUCCESS -> OrderStatus.PAID;
            case USER_CANCEL -> OrderStatus.CANCELLED;
            case PAY_TIMEOUT -> OrderStatus.TIMEOUT;
            default -> throw new IllegalArgumentException("不支持的事件");
        };
    }
    // ... 类似实现其他状态处理
}
```

## 4. 订单创建流程

```java
@Service
public class OrderService {

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        // 1. 检查库存
        checkInventory(request.getItems());
        // 2. 创建订单（待支付状态）
        Order order = buildOrder(request);
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        orderMapper.insert(order);
        // 3. 预扣库存
        deductInventory(order.getItems());
        // 4. 创建支付记录
        PaymentRecord payment = createPaymentRecord(order);
        // 5. 设置超时任务（30分钟）
        scheduleTimeoutCheck(order);
        return order;
    }
}
```

## 5. 支付回调处理

```java
@Transactional
public void handlePaymentSuccess(PaymentCallbackRequest request) {
    // 1. 验证签名
    if (!verifySignature(request)) throw new BusinessException("签名验证失败");
    // 2. 查找支付记录，检查重复回调
    // 3. 更新支付状态和订单状态
    // 4. 发送支付成功通知
    // 5. 处理后续流程（自动发货、短信通知等）
}
```

## 6. 订单取消

### 取消条件
- 待支付状态：用户可直接取消
- 已支付状态：支付后 2 小时内可取消
- 已发货/已完成：不可取消，走售后退款流程

### 取消处理

```java
@Transactional
public void cancelOrder(CancelOrderRequest request) {
    // 1. 检查取消权限（订单归属、时间限制）
    // 2. 已支付订单：发起退款
    // 3. 未支付订单：恢复库存
    // 4. 更新订单状态为 CANCELLED
    // 5. 发送取消通知
}
```

## 7. 状态变更追踪

所有状态变更记录到 `t_order_status` 表：

```java
public void recordStatusChange(Order order, OrderEvent event, String operator) {
    OrderStatusHistory history = new OrderStatusHistory();
    history.setOrderId(order.getId());
    history.setFromStatus(order.getStatus().getCode());
    history.setToStatus(getNewStatus(order, event).getCode());
    history.setOperator(operator);
    historyMapper.insert(history);
}
```

## 8. 性能优化

- **批量处理**：批量创建和更新订单
- **缓存策略**：Redis 缓存热点订单，订单状态缓存 30 分钟
- **缓存预热**：应用启动时加载活跃订单到缓存
- **异步化**：非核心流程（通知、统计）异步处理

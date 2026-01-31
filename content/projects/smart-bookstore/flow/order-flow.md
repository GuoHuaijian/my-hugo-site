---
title: "订单流程详解"
description: "智慧书店项目技术文档 - 订单流程详解"
date: 2024-01-01
weight: 5
difficulty: 2
readTime: 25
keywords: ['订单', '状态流转', '支付', '业务流程']
---

# 订单流程详解

> 订单创建、支付、取消的状态流转

## 1. 订单流程概览

### 1.1 订单生命周期
```
用户下单 → 支付订单 → 发货订单 → 完成订单
    ↓           ↓           ↓           ↓
   待支付       已支付       已发货       已完成
    ↓           ↓
   取消订单     超时取消
```

### 1.2 流程架构图
```
┌─────────────────────────────────────────────────────────────────┐
│                         订单流程管理                              │
├─────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│ │ 创建订单     │     │ 支付订单     │     │ 发货订单     │       │
│ │(状态机)      │     │(支付回调)    │     │(物流接口)    │       │
│ └──────┬──────┘     └──────┬──────┘     └──────┬──────┘       │
│        │                    │                    │           │
│        │                    │                    │           │
│        ▼                    ▼                    ▼           │
│ ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│ │ 订单状态表   │     │ 支付记录表   │     │ 物流信息表   │       │
│ └─────────────┘     └─────────────┘     └─────────────┘       │
│        │                    │                    │           │
│        │                    │                    │           │
│        ▼                    ▼                    ▼           │
│ ┌─────────────────────────────────────────────────────────┐     │
│ │                    订单状态机                            │     │
│ └─────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## 2. 订单状态设计

### 2.1 订单状态枚举
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

    private final int code;
    private final String description;

    OrderStatus(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public int getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}
```

### 2.2 状态流转表
| 当前状态 | 可转状态 | 触发条件 | 备注 |
|---------|---------|----------|------|
| PENDING_PAYMENT | PAID/CANCELLED/TIMEOUT | 支付成功/用户取消/超时 | 支付后30分钟内必须支付 |
| PAID | SHIPPED/REFUNDING | 发货成功/申请退款 | 支付后可发货 |
| SHIPPED | COMPLETED/REFUNDING | 确认收货/申请退款 | 用户确认收货后完成 |
| COMPLETED | REFUNDING | 申请退款 | 订单完成后可退款 |
| CANCELLED | - | - | 终态 |
| REFUNDING | REFUNDED | 退款成功 | 退款完成后结束 |
| REFUNDED | - | - | 终态 |
| TIMEOUT | CANCELLED | 系统自动取消 | 超时自动取消 |

### 2.3 状态机实现
```java
@Component
public class OrderStateMachine {

    /**
     * 订单状态转换
     */
    public OrderStatus transform(Order order, OrderEvent event) {
        OrderStatus currentStatus = order.getStatus();

        switch (currentStatus) {
            case PENDING_PAYMENT:
                return handlePendingPayment(order, event);
            case PAID:
                return handlePaid(order, event);
            case SHIPPED:
                return handleShipped(order, event);
            case COMPLETED:
                return handleCompleted(order, event);
            case CANCELLED:
            case REFUNDED:
            case TIMEOUT:
                return currentStatus; // 终态，不可转换
            default:
                throw new IllegalArgumentException("未知的订单状态: " + currentStatus);
        }
    }

    private OrderStatus handlePendingPayment(Order order, OrderEvent event) {
        switch (event) {
            case PAY_SUCCESS:
                return OrderStatus.PAID;
            case USER_CANCEL:
                return OrderStatus.CANCELLED;
            case PAY_TIMEOUT:
                return OrderStatus.TIMEOUT;
            default:
                throw new IllegalArgumentException("待支付状态不支持的事件: " + event);
        }
    }

    private OrderStatus handlePaid(Order order, OrderEvent event) {
        switch (event) {
            case SHIP_SUCCESS:
                return OrderStatus.SHIPPED;
            case REFUND_APPLY:
                return OrderStatus.REFUNDING;
            default:
                throw new IllegalArgumentException("已支付状态不支持的事件: " + event);
        }
    }

    private OrderStatus handleShipped(Order order, OrderEvent event) {
        switch (event) {
            case CONFIRM_RECEIVE:
                return OrderStatus.COMPLETED;
            case REFUND_APPLY:
                return OrderStatus.REFUNDING;
            default:
                throw new IllegalArgumentException("已发货状态不支持的事件: " + event);
        }
    }

    private OrderStatus handleCompleted(Order order, OrderEvent event) {
        switch (event) {
            case REFUND_APPLY:
                return OrderStatus.REFUNDING;
            default:
                throw new IllegalArgumentException("已完成状态不支持的事件: " + event);
        }
    }
}
```

## 3. 订单创建流程

### 3.1 创建流程图
```
┌─────────────────────────────────────────────────────────────────┐
│                         订单创建流程                              │
├─────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────────┐     ┌─────────────────┐                     │
│ │ 1. 检查库存     │     │ 2. 创建订单     │                     │
│ │ - 库存充足      │───► │ - 生成订单号    │                     │
│ │ - 预扣库存      │     │ - 保存订单      │                     │
│ └─────────────────┘     │ - 计算总金额    │                     │
│                         └─────────────────┘                     │
│                                │                               │
│                                ▼                               │
│                       ┌─────────────────┐                       │
│                       │ 3. 支付流程     │                       │
│                       │ - 调用支付接口  │                       │
│                       │ - 生成支付链接  │                       │
│                       └─────────────────┘                       │
│                                │                               │
│                                ▼                               │
│                       ┌─────────────────┐                       │
│                       │ 4. 创建支付记录 │                       │
│                       │ - 保存支付信息  │                       │
│                       │ - 发送支付通知  │                       │
│                       └─────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 创建订单实现
```java
@Service
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderStateMachine stateMachine;

    /**
     * 创建订单
     */
    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        // 1. 检查库存
        checkInventory(request.getItems());

        // 2. 创建订单
        Order order = buildOrder(request);
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        orderMapper.insert(order);

        // 3. 预扣库存
        deductInventory(order.getItems());

        // 4. 创建支付记录
        PaymentRecord payment = createPaymentRecord(order);
        paymentService.createPayment(payment);

        // 5. 发送通知
        notifyOrderCreated(order);

        // 6. 设置超时任务
        scheduleTimeoutCheck(order);

        return order;
    }

    /**
     * 构建订单
     */
    private Order buildOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setUserId(request.getUserId());
        order.setTotalAmount(calculateTotalAmount(request.getItems()));
        order.setShippingFee(calculateShippingFee());
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        order.setCreateTime(new Date());

        // 设置订单项
        List<OrderItem> items = request.getItems().stream()
            .map(this::buildOrderItem)
            .collect(Collectors.toList());
        order.setItems(items);

        return order;
    }

    /**
     * 检查库存
     */
    private void checkInventory(List<OrderItemDTO> items) {
        for (OrderItemDTO item : items) {
            Inventory inventory = inventoryService.checkInventory(item.getProductId(), item.getQuantity());
            if (inventory == null) {
                throw new BusinessException("商品库存不足: " + item.getProductId());
            }
        }
    }

    /**
     * 预扣库存
     */
    private void deductInventory(List<OrderItemDTO> items) {
        for (OrderItemDTO item : items) {
            inventoryService.deductInventory(item.getProductId(), item.getQuantity(), order.getOrderNo());
        }
    }

    /**
     * 生成订单号
     */
    private String generateOrderNo() {
        return "ORD" + System.currentTimeMillis() + String.format("%04d", new Random().nextInt(10000));
    }

    /**
     * 设置超时任务
     */
    private void scheduleTimeoutCheck(Order order) {
        // 30分钟后检查支付状态
        CompletableFuture.runAsync(() -> {
            try {
                Thread.sleep(30 * 60 * 1000);
                checkOrderTimeout(order);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }
}
```

## 4. 支付流程

### 4.1 支付流程图
```
┌─────────────────────────────────────────────────────────────────┐
│                         支付流程                                  │
├─────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────────┐     ┌─────────────────┐                     │
│ │ 1. 生成支付     │     │ 2. 调用支付     │                     │
│ │ - 支付链接      │◄─── │ - 微信/支付宝   │                     │
│ │ - 支付金额      │     │ - 第三方回调    │                     │
│ └─────────────────┘     └─────────────────┘                     │
│                                │                               │
│                                ▼                               │
│                       ┌─────────────────┐                       │
│                       │ 3. 接收回调     │                       │
│                       │ - 验证签名      │                       │
│                       │ - 更新支付状态  │                       │
│                       └─────────────────┘                       │
│                                │                               │
│                                ▼                               │
│                       ┌─────────────────┐                       │
│                       │ 4. 状态更新     │                       │
│                       │ - 订单状态      │                       │
│                       │ - 发送通知      │                       │
│                       └─────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 支付回调处理
```java
@Service
public class PaymentCallbackService {

    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentMapper paymentMapper;

    /**
     * 支付成功回调
     */
    @Transactional
    public void handlePaymentSuccess(PaymentCallbackRequest request) {
        // 1. 验证签名
        if (!verifySignature(request)) {
            throw new BusinessException("签名验证失败");
        }

        // 2. 查找支付记录
        PaymentRecord payment = paymentMapper.findByTradeNo(request.getTradeNo());
        if (payment == null) {
            throw new BusinessException("支付记录不存在");
        }

        // 3. 检查重复回调
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            log.warn("重复回调: {}", request.getTradeNo());
            return;
        }

        // 4. 更新支付状态
        payment.setPayTime(new Date());
        payment.setTransactionNo(request.getTransactionNo());
        payment.setStatus(PaymentStatus.SUCCESS);
        paymentMapper.update(payment);

        // 5. 更新订单状态
        Order order = orderMapper.findById(payment.getOrderId());
        OrderStatus newStatus = orderService.getPaymentSuccessStatus(order);
        order.setStatus(newStatus);
        orderMapper.update(order);

        // 6. 发送通知
        notifyPaymentSuccess(order);

        // 7. 处理后续流程
        handleAfterPayment(order);
    }

    /**
     * 处理支付后流程
     */
    private void handleAfterPayment(Order order) {
        // 发货
        if (order.getAutoShip()) {
            shipOrder(order);
        }

        // 发送短信通知
        sendSmsNotification(order);

        // 更新统计
        updateOrderStatistics(order);
    }

    /**
     * 验证签名
     */
    private boolean verifySignature(PaymentCallbackRequest request) {
        String sign = request.getSign();
        String params = buildSignParams(request);
        String calculatedSign = SignUtil.sign(params);
        return sign.equals(calculatedSign);
    }
}
```

## 5. 订单发货流程

### 5.1 发货流程实现
```java
@Service
public class ShipService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private LogisticsService logisticsService;

    @Autowired
    private InventoryService inventoryService;

    /**
     * 发货
     */
    @Transactional
    public void shipOrder(ShipRequest request) {
        // 1. 验证订单
        Order order = validateOrder(request.getOrderId());

        // 2. 检查库存
        checkInventory(order.getItems());

        // 3. 创建物流单
        Logistics logistics = createLogistics(order, request);

        // 4. 更新订单状态
        order.setStatus(OrderStatus.SHIPPED);
        order.setShipTime(new Date());
        order.setLogisticsNo(logistics.getLogisticsNo());
        orderMapper.update(order);

        // 5. 减少库存
        for (OrderItem item : order.getItems()) {
            inventoryService.confirmDeduct(item.getProductId(), item.getQuantity());
        }

        // 6. 发送通知
        notifyOrderShipped(order, logistics);

        // 7. 推送物流信息
        logisticsService.pushLogisticsInfo(logistics);
    }

    /**
     * 创建物流单
     */
    private Logistics createLogistics(Order order, ShipRequest request) {
        Logistics logistics = new Logistics();
        logistics.setLogisticsNo(generateLogisticsNo());
        logistics.setOrderId(order.getId());
        logistics.setConsignee(order.getConsignee());
        logistics.setPhone(order.getPhone());
        logistics.setAddress(order.getAddress());
        logistics.setShippingCompany(request.getShippingCompany());
        logistics.setTrackingNo(request.getTrackingNo());
        logistics.setShipTime(new Date());
        logistics.setStatus("SHIPPED");

        // 保存物流信息
        logisticsService.saveLogistics(logistics);

        return logistics;
    }

    /**
     * 生成物流单号
     */
    private String generateLogisticsNo() {
        return "SF" + System.currentTimeMillis() + String.format("%06d", new Random().nextInt(1000000));
    }
}
```

## 6. 订单取消流程

### 6.1 取消流程图
```
┌─────────────────────────────────────────────────────────────────┐
│                         订单取消流程                              │
├─────────────────────────────────────────────────────────────────┤
│ │
│ ┌─────────────────┐     ┌─────────────────┐                     │
│ │ 1. 申请取消     │     │ 2. 验证权限     │                     │
│ │ - 用户请求      │◄─── │ - 订单归属      │                     │
│ │ - 取消原因      │     │ - 时间限制      │                     │
│ └─────────────────┘     └─────────────────┘                     │
│                                │                               │
│                                ▼                               │
│                       ┌─────────────────┐                       │
│                       │ 3. 处理取消     │                       │
│                       │ - 退款处理      │                       │
│                       │ - 恢复库存      │                       │
│                       └─────────────────┘                       │
│                                │                               │
│                                ▼                               │
│                       ┌─────────────────┐                       │
│                       │ 4. 状态更新     │                       │
│                       │ - 更新订单      │                       │
│                       │ - 发送通知      │                       │
│                       └─────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 取消订单实现
```java
@Service
public class CancelOrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private InventoryService inventoryService;

    /**
     * 取消订单
     */
    @Transactional
    public void cancelOrder(CancelOrderRequest request) {
        // 1. 查找订单
        Order order = orderMapper.findById(request.getOrderId());
        if (order == null) {
            throw new BusinessException("订单不存在");
        }

        // 2. 检查取消权限
        checkCancelPermission(order, request);

        // 3. 处理取消
        handleCancel(order, request.getReason());

        // 4. 更新状态
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelTime(new Date());
        order.setCancelReason(request.getReason());
        orderMapper.update(order);

        // 5. 通知相关人员
        notifyOrderCancelled(order);

        // 6. 处理后续
        handleAfterCancel(order);
    }

    /**
     * 检查取消权限
     */
    private void checkCancelPermission(Order order, CancelOrderRequest request) {
        // 检查订单状态
        if (order.getStatus() == OrderStatus.COMPLETED ||
            order.getStatus() == OrderStatus.SHIPPED) {
            throw new BusinessException("订单已发货或完成，无法取消");
        }

        // 检查时间限制
        if (order.getStatus() == OrderStatus.PAID) {
            // 支付后2小时内可取消
            long hoursPassed = ChronoUnit.HOURS.between(
                order.getPayTime().toInstant(),
                Instant.now()
            );
            if (hoursPassed > 2) {
                throw new BusinessException("支付超过2小时，无法取消");
            }
        }

        // 检查用户权限
        if (!order.getUserId().equals(request.getUserId())) {
            throw new BusinessException("无权限取消此订单");
        }
    }

    /**
     * 处理取消逻辑
     */
    private void handleCancel(Order order, String reason) {
        if (order.getStatus() == OrderStatus.PAID) {
            // 已支付订单需要退款
            processRefund(order);
        } else if (order.getStatus() == OrderStatus.PENDING_PAYMENT) {
            // 未支付订单恢复库存
            restoreInventory(order.getItems());
        }
    }

    /**
     * 处理退款
     */
    private void processRefund(Order order) {
        // 1. 创建退款单
        RefundRequest refund = buildRefundRequest(order);
        refundService.createRefund(refund);

        // 2. 调用支付接口退款
        PaymentRecord payment = paymentService.findByOrderId(order.getId());
        RefundResult result = paymentService.refund(payment, order.getTotalAmount());

        // 3. 更新退款状态
        refund.setRefundTime(new Date());
        refund.setTransactionNo(result.getTransactionNo());
        refund.setStatus(RefundStatus.SUCCESS);
        refundService.update(refund);
    }

    /**
     * 恢复库存
     */
    private void restoreInventory(List<OrderItem> items) {
        for (OrderItem item : items) {
            inventoryService.restoreInventory(item.getProductId(), item.getQuantity());
        }
    }
}
```

## 7. 状态管理实现

### 7.1 状态变更记录
```java
@Service
public class OrderStatusHistoryService {

    @Autowired
    private OrderStatusHistoryMapper historyMapper;

    /**
     * 记录状态变更
     */
    public void recordStatusChange(Order order, OrderEvent event, String operator) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrderId(order.getId());
        history.setFromStatus(order.getStatus().getCode());
        history.setToStatus(getNewStatus(order, event).getCode());
        history.setEvent(event.getCode());
        history.setOperator(operator);
        history.setRemark(getEventRemark(event));
        history.setCreateTime(new Date());

        historyMapper.insert(history);
    }

    /**
     * 获取状态变更历史
     */
    public List<OrderStatusHistory> getHistory(Long orderId) {
        return historyMapper.findByOrderId(orderId);
    }

    /**
     * 生成状态变更记录
     */
    public String generateStatusReport(Long orderId) {
        List<OrderStatusHistory> histories = getHistory(orderId);

        StringBuilder report = new StringBuilder();
        report.append("订单状态变更历史:\n");

        for (OrderStatusHistory history : histories) {
            report.append(String.format("[%s] %s → %s (%s) 操作人: %s\n",
                history.getCreateTime(),
                OrderStatus.fromCode(history.getFromStatus()),
                OrderStatus.fromCode(history.getToStatus()),
                history.getEvent(),
                history.getOperator()
            ));
        }

        return report.toString();
    }
}
```

### 7.2 状态机配置
```java
@Configuration
public class StateMachineConfig {

    @Bean
    public StateMachine<OrderStatus, OrderEvent> orderStateMachine() {
        Builder<OrderStatus, OrderEvent> builder = StateMachineBuilder.builder();

        builder.configureStates()
            .initial(OrderStatus.PENDING_PAYMENT)
            .state(OrderStatus.PAID)
            .state(OrderStatus.SHIPPED)
            .state(OrderStatus.COMPLETED)
            .state(OrderStatus.CANCELLED)
            .state(OrderStatus.REFUNDING)
            .state(OrderStatus.REFUNDED)
            .state(OrderStatus.TIMEOUT);

        builder.configureTransitions()
            .withExternal()
                .source(OrderStatus.PENDING_PAYMENT)
                .target(OrderStatus.PAID)
                .event(OrderEvent.PAY_SUCCESS)
            .and()
            .withExternal()
                .source(OrderStatus.PENDING_PAYMENT)
                .target(OrderStatus.CANCELLED)
                .event(OrderEvent.USER_CANCEL)
            .and()
            .withExternal()
                .source(OrderStatus.PAID)
                .target(OrderStatus.SHIPPED)
                .event(OrderEvent.SHIP_SUCCESS)
            .and()
            .withExternal()
                .source(OrderStatus.SHIPPED)
                .target(OrderStatus.COMPLETED)
                .event(OrderEvent.CONFIRM_RECEIVE);

        return builder.build();
    }
}
```

## 8. 性能优化

### 8.1 批量处理
```java
@Service
public class BatchOrderService {

    @Autowired
    private OrderMapper orderMapper;

    /**
     * 批量创建订单
     */
    @Transactional
    public List<Order> batchCreateOrders(List<CreateOrderRequest> requests) {
        // 1. 批量检查库存
        batchCheckInventory(requests);

        // 2. 批量创建订单
        List<Order> orders = requests.stream()
            .map(this::createOrder)
            .collect(Collectors.toList());

        // 3. 批量保存
        orderMapper.batchInsert(orders);

        // 4. 异步处理后续流程
        CompletableFuture.runAsync(() -> {
            handleBatchPostProcess(orders);
        });

        return orders;
    }

    /**
     * 异步处理后续流程
     */
    private void handleBatchPostProcess(List<Order> orders) {
        for (Order order : orders) {
            try {
                scheduleTimeoutCheck(order);
                notifyOrderCreated(order);
            } catch (Exception e) {
                log.error("处理后续流程失败: {}", order.getId(), e);
            }
        }
    }
}
```

### 8.2 缓存优化
```java
@Service
public class OrderCacheService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String ORDER_CACHE_PREFIX = "order:";
    private static final String ORDER_STATUS_CACHE_PREFIX = "order:status:";
    private static final long CACHE_EXPIRE = 30 * 60; // 30分钟

    /**
     * 缓存订单
     */
    public void cacheOrder(Order order) {
        String key = ORDER_CACHE_PREFIX + order.getId();
        redisTemplate.opsForValue().set(key, order, CACHE_EXPIRE, TimeUnit.SECONDS);
    }

    /**
     * 获取缓存订单
     */
    public Order getCachedOrder(Long orderId) {
        String key = ORDER_CACHE_PREFIX + orderId;
        return (Order) redisTemplate.opsForValue().get(key);
    }

    /**
     * 缓存订单状态
     */
    public void cacheOrderStatus(Long orderId, OrderStatus status) {
        String key = ORDER_STATUS_CACHE_PREFIX + orderId;
        redisTemplate.opsForValue().set(key, status, CACHE_EXPIRE, TimeUnit.SECONDS);
    }

    /**
     * 获取缓存状态
     */
    public OrderStatus getCachedOrderStatus(Long orderId) {
        String key = ORDER_STATUS_CACHE_PREFIX + orderId;
        return (OrderStatus) redisTemplate.opsForValue().get(key);
    }

    /**
     * 预热缓存
     */
    @PostConstruct
    public void warmUpCache() {
        List<Order> activeOrders = orderMapper.findActiveOrders();
        for (Order order : activeOrders) {
            cacheOrder(order);
            cacheOrderStatus(order.getId(), order.getStatus());
        }
    }
}
```

## 9. 监控和告警

### 9.1 订单监控
```java
@Service
public class OrderMonitor {

    @Autowired
    private MeterRegistry meterRegistry;

    /**
     * 记录订单创建
     */
    public void recordOrderCreated(Order order) {
        meterRegistry.counter("order.created",
            Tags.of("status", order.getStatus().name(),
                    "user_type", getUserType(order.getUserId()))
        ).increment();

        // 记录订单金额分布
        if (order.getTotalAmount() > 1000) {
            meterRegistry.counter("order.high_value").increment();
        }
    }

    /**
     * 记录订单状态变更
     */
    public void recordOrderStatusChange(OrderStatus from, OrderStatus to) {
        meterRegistry.gauge("order.status.transition",
            Tags.of("from", from.name(), "to", to.name()),
            1
        );
    }

    /**
     * 检查异常订单
     */
    @Scheduled(fixedRate = 300000) // 5分钟检查一次
    public void checkAbnormalOrders() {
        List<Order> abnormalOrders = findAbnormalOrders();

        if (!abnormalOrders.isEmpty()) {
            sendAlert("ABNORMAL_ORDERS", "发现异常订单数量: " + abnormalOrders.size());
            abnormalOrders.forEach(this::handleAbnormalOrder);
        }
    }
}
```

### 9.2 性能监控
```java
@Service
public class OrderPerformanceMonitor {

    private final Timer orderCreateTimer;
    private final Timer paymentProcessTimer;

    public OrderPerformanceMonitor(MeterRegistry meterRegistry) {
        this.orderCreateTimer = Timer.builder("order.create.duration")
            .description("订单创建耗时")
            .register(meterRegistry);

        this.paymentProcessTimer = Timer.builder("payment.process.duration")
            .description("支付处理耗时")
            .register(meterRegistry);
    }

    /**
     * 监控订单创建性能
     */
    public Order monitorCreateOrder(Consumer<Order> task) {
        return orderCreateTimer.record(() -> {
            Order order = new Order();
            task.accept(order);
            return order;
        });
    }

    /**
     * 监控支付处理性能
     */
    public PaymentRecord monitorPaymentProcess(Consumer<PaymentRecord> task) {
        return paymentProcessTimer.record(() -> {
            PaymentRecord payment = new PaymentRecord();
            task.accept(payment);
            return payment;
        });
    }
}
```

## 10. 最佳实践

### 10.1 状态管理
1. **状态清晰**：明确定义所有状态及其转换条件
2. **幂等处理**：同一操作重复执行不会改变状态
3. **状态记录**：完整记录状态变更历史
4. **异常处理**：处理状态转换过程中的异常情况

### 10.2 事务管理
1. **长事务处理**：避免长事务，拆分成多个小事务
2. **补偿机制**：实现补偿事务，保证数据一致性
3. **重试策略**：网络失败时自动重试
4. **隔离级别**：根据业务选择合适的隔离级别

### 10.3 性能优化
1. **批量处理**：批量创建、更新订单
2. **异步处理**：非核心流程异步化
3. **缓存策略**：合理使用缓存提高性能
4. **分库分表**：大表拆分，提高查询效率

### 10.4 监控告警
1. **关键指标**：监控订单量、支付成功率、取消率
2. **性能监控**：监控订单创建、支付处理耗时
3. **异常告警**：及时处理异常订单
4. **趋势分析**：分析订单数据趋势，预测业务变化

---

[返回文档首页](../README.md) | [上一篇：秒杀全流程详解](./seckill-flow.md) | [下一篇：数据流转图](./data-flow.md)

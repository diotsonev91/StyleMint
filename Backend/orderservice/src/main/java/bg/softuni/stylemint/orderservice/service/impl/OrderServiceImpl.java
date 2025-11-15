package bg.softuni.stylemint.orderservice.service.impl;

import bg.softuni.stylemint.orderservice.dto.*;
import bg.softuni.stylemint.orderservice.enums.*;
import bg.softuni.stylemint.orderservice.exception.InvalidPaymentMethodException;
import bg.softuni.stylemint.orderservice.exception.MissingDeliveryAddressException;
import bg.softuni.stylemint.orderservice.exception.*;
import bg.softuni.stylemint.orderservice.model.Order;
import bg.softuni.stylemint.orderservice.model.OrderItem;
import bg.softuni.stylemint.orderservice.repository.OrderItemRepository;
import bg.softuni.stylemint.orderservice.repository.OrderRepository;
import bg.softuni.stylemint.orderservice.service.OrderService;
import bg.softuni.stylemint.orderservice.service.StripeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final StripeService stripeService;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    // ============================================================
    // CREATE ORDER
    // ============================================================
    @Override
    @Transactional
    public CreateOrderResponseDTO createOrder(CreateOrderRequestDTO request) {

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must have at least one item.");
        }

        boolean containsClothes = request.getItems().stream()
                .anyMatch(i -> i.getProductType() == ProductType.CLOTHES);

        boolean containsDigital = request.getItems().stream()
                .anyMatch(i -> i.getProductType() == ProductType.SAMPLE ||
                        i.getProductType() == ProductType.PACK);

        // Digital + Clothes => MUST USE STRIPE
        if (containsDigital && request.getPaymentMethod() == PaymentMethod.CASH) {
            throw new InvalidPaymentMethodException(
                    "Cash is only allowed for clothes. Digital items require Stripe payment."
            );
        }

        // Digital only => MUST USE STRIPE
        if (containsDigital && request.getPaymentMethod() != PaymentMethod.STRIPE) {
            throw new InvalidPaymentMethodException(
                    "Digital items require Stripe payment."
            );
        }

        // Clothes => require delivery address
        if (containsClothes &&
                (request.getDeliveryAddress() == null || request.getDeliveryAddress().isBlank())) {
            throw new MissingDeliveryAddressException();
        }

        // Calculate total
        double totalAmount = request.getItems().stream()
                .mapToDouble(i -> i.getPricePerUnit() * i.getQuantity())
                .sum();

        // Create order
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(OffsetDateTime.now());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        // Save order items
        List<OrderItem> items = request.getItems().stream()
                .map(i -> OrderItem.builder()
                        .order(savedOrder)
                        .productType(i.getProductType())
                        .productId(i.getProductId())
                        .quantity(i.getQuantity())
                        .pricePerUnit(i.getPricePerUnit())
                        .customizationJson(i.getCustomizationJson())
                        .itemStatus(OrderItemStatus.PENDING)
                        .build())
                .toList();

        orderItemRepository.saveAll(items);

        // Stripe checkout URL
        String paymentUrl = null;
        if (request.getPaymentMethod() == PaymentMethod.STRIPE) {
            String successUrl = "https://stylemint.com/payment/success?orderId=" + savedOrder.getId();
            String cancelUrl = "https://stylemint.com/payment/cancel?orderId=" + savedOrder.getId();

            paymentUrl = stripeService.createCheckoutSession(
                    totalAmount,
                    savedOrder.getId(),
                    successUrl,
                    cancelUrl
            );
        }

        return CreateOrderResponseDTO.builder()
                .orderId(savedOrder.getId())
                .totalAmount(totalAmount)
                .paymentUrl(paymentUrl)
                .status(savedOrder.getStatus().name())
                .build();
    }

    // ============================================================
    // PUBLIC DTO RETURN METHODS
    // ============================================================

    @Override
    public OrderDTO getOrder(UUID orderId) {
        Order order = getOrderEntity(orderId);
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        return toOrderDTO(order, items);
    }

    @Override
    public List<OrderItemDTO> getOrderItems(UUID orderId) {
        return orderItemRepository.findByOrderId(orderId)
                .stream()
                .map(this::toItemDTO)
                .toList();
    }

    @Override
    public OrderStatusDTO getOrderStatus(UUID orderId) {
        return new OrderStatusDTO(
                getOrderEntity(orderId).getStatus()
        );
    }

    // ============================================================
    // INTERNAL ENTITY METHODS
    // ============================================================

    @Override
    public Order getOrderEntity(UUID orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));
    }

    @Override
    public List<OrderItem> getOrderItemEntities(UUID orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    // ============================================================
    // ORDER-LEVEL STATUS OPERATIONS
    // ============================================================

    @Override
    @Transactional
    public void markOrderAsPaid(UUID orderId) {
        Order order = getOrderEntity(orderId);
        List<OrderItem> items = getOrderItemEntities(orderId);

        // Mark item statuses
        items.forEach(i -> i.setItemStatus(OrderItemStatus.PAID));
        orderItemRepository.saveAll(items);

        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void markOrderAsFailed(UUID orderId) {
        Order order = getOrderEntity(orderId);
        order.setStatus(OrderStatus.FAILED);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void markOrderAsCancelled(UUID orderId) {
        Order order = getOrderEntity(orderId);

        List<OrderItem> items = getOrderItemEntities(orderId);
        items.forEach(i -> i.setItemStatus(OrderItemStatus.CANCELLED));
        orderItemRepository.saveAll(items);

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void markOrderAsFulfilled(UUID orderId) {
        Order order = getOrderEntity(orderId);
        order.setStatus(OrderStatus.FULFILLED);
        orderRepository.save(order);
    }

    // ============================================================
    // ITEM-LEVEL STATUS OPERATIONS
    // ============================================================

    @Override
    @Transactional
    public void markOrderItemDigitalUnlocked(UUID orderId, UUID itemId) {
        OrderItem item = getValidatedOrderItem(orderId, itemId);
        item.setItemStatus(OrderItemStatus.DIGITAL_UNLOCKED);
        orderItemRepository.save(item);
        recalcOrderStatus(orderId);
    }

    @Override
    @Transactional
    public void markOrderItemShipped(UUID orderId, UUID itemId) {
        OrderItem item = getValidatedOrderItem(orderId, itemId);
        item.setItemStatus(OrderItemStatus.SHIPPED);
        orderItemRepository.save(item);
        recalcOrderStatus(orderId);
    }

    @Override
    @Transactional
    public void markOrderItemDelivered(UUID orderId, UUID itemId) {
        OrderItem item = getValidatedOrderItem(orderId, itemId);
        item.setItemStatus(OrderItemStatus.DELIVERED);
        orderItemRepository.save(item);
        recalcOrderStatus(orderId);
    }

    @Override
    @Transactional
    public void cancelOrderItem(UUID orderId, UUID itemId) {
        OrderItem item = getValidatedOrderItem(orderId, itemId);
        item.setItemStatus(OrderItemStatus.CANCELLED);
        orderItemRepository.save(item);
        recalcOrderStatus(orderId);
    }

    // =============================================================
    // STATS
    // ============================================================

    @Override
    public UserOrderSummaryDTO getUserOrderSummary(UUID userId) {
        // 1. Get total number of orders
        Long totalOrders = orderRepository.countByUserId(userId);

        // 2. Get last 10 orders
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Order> recentOrders = orderRepository.findByUserId(userId, pageable);

        // 3. Get all items for these orders in one query (optimization)
        List<UUID> orderIds = recentOrders.stream()
                .map(Order::getId)
                .toList();
        List<OrderItem> allItems = orderItemRepository.findByOrderIdIn(orderIds);

        // 4. Group items by orderId
        Map<UUID, List<OrderItem>> itemsByOrderId = allItems.stream()
                .collect(Collectors.groupingBy(item -> item.getOrder().getId()));

        // 5. Map to OrderPreviewDTO
        List<OrderPreviewDTO> recentOrderDTOs = recentOrders.stream()
                .map(order -> mapToOrderPreviewDTO(order, itemsByOrderId.get(order.getId())))
                .toList();

        // 6. Calculate total spent amount
        Double totalSpent = orderRepository.calculateTotalSpentByUser(userId);

        return UserOrderSummaryDTO.builder()
                .totalOrders(totalOrders)
                .recentOrders(recentOrderDTOs)
                .totalSpent(totalSpent != null ? totalSpent : 0.0)
                .build();
    }

    // ============================================================
    // SHIP AND DELIVERY MOCKING
    // ============================================================

    @Override
    @Transactional
    public void markOrderItemShippedForAll(UUID orderId) {
        List<OrderItem> items = getOrderItemEntities(orderId);

        items.forEach(i -> i.setItemStatus(OrderItemStatus.SHIPPED));
        orderItemRepository.saveAll(items);

        recalcOrderStatus(orderId);
    }

    @Override
    @Transactional
    public void markOrderItemDeliveredForAll(UUID orderId) {
        List<OrderItem> items = getOrderItemEntities(orderId);

        items.forEach(i -> i.setItemStatus(OrderItemStatus.DELIVERED));
        orderItemRepository.saveAll(items);

        recalcOrderStatus(orderId);
    }



    // ============================================================
    // HELPERS
    // ============================================================

    private OrderItem getValidatedOrderItem(UUID orderId, UUID itemId) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Order item not found: " + itemId));

        if (!item.getOrder().getId().equals(orderId)) {
            throw new IllegalArgumentException("Item does not belong to this order.");
        }
        return item;
    }

    private void recalcOrderStatus(UUID orderId) {
        Order order = getOrderEntity(orderId);
        List<OrderItem> items = getOrderItemEntities(orderId);

        boolean allFinished = items.stream().allMatch(i ->
                i.getItemStatus() == OrderItemStatus.DIGITAL_UNLOCKED ||
                        i.getItemStatus() == OrderItemStatus.DELIVERED ||
                        i.getItemStatus() == OrderItemStatus.CANCELLED
        );

        boolean anyFinished = items.stream().anyMatch(i ->
                i.getItemStatus() == OrderItemStatus.DIGITAL_UNLOCKED ||
                        i.getItemStatus() == OrderItemStatus.DELIVERED
        );

        if (allFinished && anyFinished) {
            order.setStatus(OrderStatus.FULFILLED);
        } else if (anyFinished) {
            order.setStatus(OrderStatus.PARTIALLY_FULFILLED);
        }

        orderRepository.save(order);
    }

    public boolean containsClothes(UUID orderId) {
        return orderItemRepository.findByOrderId(orderId)
                .stream()
                .anyMatch(i -> i.getProductType() == ProductType.CLOTHES);
    }

    @Override
    public boolean containsDigitalAssets(UUID orderId) {
        return orderItemRepository.existsByOrderIdAndProductTypeIn(
                orderId,
                List.of(ProductType.SAMPLE, ProductType.PACK)
        );
    }

    @Override
    public List<OrderItem> getClothingItems(UUID orderId) {
        return orderItemRepository.findByOrderIdAndProductType(orderId, ProductType.CLOTHES);
    }



    // ============================================================
    // DTO MAPPERS
    // ============================================================

    private OrderDTO toOrderDTO(Order order, List<OrderItem> items) {
        return OrderDTO.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .deliveryAddress(order.getDeliveryAddress())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .items(items.stream().map(this::toItemDTO).toList())
                .build();
    }

    private OrderItemDTO toItemDTO(OrderItem item) {
        return OrderItemDTO.builder()
                .itemId(item.getId())
                .productId(item.getProductId())
                .productType(item.getProductType())
                .quantity(item.getQuantity())
                .pricePerUnit(item.getPricePerUnit())
                .customizationJson(item.getCustomizationJson())
                .itemStatus(item.getItemStatus())
                .build();
    }

    private OrderPreviewDTO mapToOrderPreviewDTO(Order order, List<OrderItem> orderItems) {
        if (orderItems == null) {
            orderItems = List.of();
        }

        List<OrderItemDTO> itemDTOs = orderItems.stream()
                .map(this::mapToOrderItemDTO)
                .toList();

        Double totalAmount = orderItems.stream()
                .mapToDouble(item -> item.getPricePerUnit() * item.getQuantity())
                .sum();

        return OrderPreviewDTO.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .totalAmount(totalAmount)
                .createdAt(order.getCreatedAt())
                .items(itemDTOs)
                .build();
    }

    private OrderItemDTO mapToOrderItemDTO(OrderItem orderItem) {
        return OrderItemDTO.builder()
                .itemId(orderItem.getId())
                .productType(orderItem.getProductType())
                .productId(orderItem.getProductId())
                .quantity(orderItem.getQuantity())
                .pricePerUnit(orderItem.getPricePerUnit())
                .customizationJson(orderItem.getCustomizationJson())
                .itemStatus(orderItem.getItemStatus())
                .build();
    }
}

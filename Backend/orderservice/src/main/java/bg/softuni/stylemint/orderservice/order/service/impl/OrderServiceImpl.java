package bg.softuni.stylemint.orderservice.order.service.impl;

import bg.softuni.dtos.enums.order.OrderItemStatus;
import bg.softuni.dtos.enums.order.OrderStatus;
import bg.softuni.dtos.enums.payment.ProductType;
import bg.softuni.dtos.order.*;
import bg.softuni.events.delivery.StartDeliveryEvent;
import bg.softuni.stylemint.orderservice.order.helpers.DtoMappers;
import bg.softuni.stylemint.orderservice.exceptions.*;

import bg.softuni.stylemint.orderservice.order.model.Order;
import bg.softuni.stylemint.orderservice.order.model.OrderItem;
import bg.softuni.stylemint.orderservice.order.repository.OrderItemRepository;
import bg.softuni.stylemint.orderservice.order.repository.OrderRepository;
import bg.softuni.stylemint.orderservice.order.service.OrderService;

import bg.softuni.stylemint.orderservice.outbox.enums.OutboxEventType;
import bg.softuni.stylemint.orderservice.outbox.model.OutboxEvent;
import bg.softuni.stylemint.orderservice.outbox.repository.OutboxEventRepository;
import bg.softuni.stylemint.orderservice.payment.service.PaymentResult;
import bg.softuni.stylemint.orderservice.payment.service.PaymentService;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentService paymentService;
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;
    // ============================================================
    // CREATE ORDER
    // ============================================================
    @Override
    @Transactional
    public CreateOrderResponseDTO createOrder(CreateOrderRequestDTO request) {

        // 1) Validate payment and rules
        paymentService.validatePaymentMethod(request);

        // 2) Calculate total amount
        double totalAmount = request.getItems().stream()
                .mapToDouble(i -> i.getPricePerUnit() * i.getQuantity())
                .sum();

        // 3) Create the Order entity
        Order order = Order.builder()
                .userId(request.getUserId())
                .paymentMethod(request.getPaymentMethod())
                .status(OrderStatus.PENDING)
                .createdAt(OffsetDateTime.now())
                .deliveryAddress(request.getDeliveryAddress())
                .totalAmount(totalAmount)
                .build();

        Order savedOrder = orderRepository.save(order);

        // 4) Persist OrderItems
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

        // ⭐⭐⭐ CHANGE: Pass frontendUrl to PaymentService ⭐⭐⭐
        // 5) Delegate payment logic to PaymentService
        PaymentResult result = paymentService.initiatePayment(savedOrder, items, frontendUrl);


        if (result.shouldDeliverClothes()) {
            List<OrderItem> clothesItems = items.stream()
                    .filter(i -> i.getProductType() == ProductType.CLOTHES)
                    .toList();

            if (!clothesItems.isEmpty()) {
                saveDeliveryOutboxEvent(savedOrder.getId(), clothesItems, request, OutboxEventType.START_DELIVERY);
            }
        }


        // ============================================================
        // STRIPE FLOW - Add logging
        // ============================================================
        log.info("✅ Order created: {}", savedOrder.getId());
        log.info("💳 Payment URL: {}", result.paymentUrl());
        if (result.paymentUrl() != null) {
            log.info("📍 Success URL: {}/checkout/success?orderId={}", frontendUrl, savedOrder.getId());
            log.info("📍 Cancel URL: {}/checkout/cancel?orderId={}", frontendUrl, savedOrder.getId());
        }

        return CreateOrderResponseDTO.builder()
                .orderId(savedOrder.getId())
                .totalAmount(totalAmount)
                .paymentUrl(result.paymentUrl()) // Stripe checkout URL
                .status(savedOrder.getStatus().name())
                .build();
    }

    @Transactional
    public void saveDeliveryOutboxEvent(UUID orderId,
                                        List<OrderItem> clothesItems,
                                        CreateOrderRequestDTO request
                                        ,OutboxEventType eventType) {

        StartDeliveryEvent event = new StartDeliveryEvent(
                orderId,
                clothesItems.stream().map(OrderItem::getId).toList(),
                request.getDeliveryAddress(),
                request.getUserName(),
                request.getUserPhone()
        );

        String json;
        try {
            json = objectMapper.writeValueAsString(event);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize StartDeliveryEvent", e);
        }

        OutboxEvent outboxEvent = OutboxEvent.builder()
                .orderId(orderId)
                .payloadJson(json)
                .eventType(eventType)
                .createdAt(OffsetDateTime.now())
                .processed(false)
                .build();

        outboxEventRepository.save(outboxEvent);

        log.info("📥 Outbox event stored for order {}", orderId);
    }

    // ============================================================
    // PUBLIC DTO RETURN METHODS
    // ============================================================

    @Override
    public OrderDTO getOrder(UUID orderId) {
        Order order = getOrderEntity(orderId);
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        return DtoMappers.toOrderDTO(order, items);
    }

    @Override
    public List<OrderItemDTO> getOrderItems(UUID orderId) {
        return orderItemRepository.findByOrderId(orderId)
                .stream()
                .map(DtoMappers::toItemDTO)
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

        for (OrderItem item : items) {

            // 🧵 1) Ако е дреха → НЕ пипаме (обработва се по Kafka)
            if (item.getProductType() == ProductType.CLOTHES) {
                log.info("🧵 Skipping CLOTHES item {} when marking PAID", item.getId());
                continue;
            }

            // 🔓 2) Ако вече е DIGITAL_UNLOCKED → НЕ пипаме (main-api-service го е отключил)
            if (item.getItemStatus() == OrderItemStatus.DIGITAL_UNLOCKED) {
                log.info("🔓 Skipping DIGITAL_UNLOCKED item {} (already processed)", item.getId());
                continue;
            }

            // 💾 3) Ако НЕ е дреха и НЕ е unlocked → маркираме като PAID
            log.info("💰 Marking digital item {} as PAID", item.getId());
            item.setItemStatus(OrderItemStatus.PAID);


        }

        orderItemRepository.saveAll(items);


        recalcOrderStatus(orderId);
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

    // ============================================================
    // ITEM-LEVEL STATUS OPERATIONS
    // ============================================================

    @Override
    @Transactional
    public void markOrderItemDigitalUnlocked(UUID orderId, UUID itemId) {
        OrderItem item = getValidatedOrderItem(orderId, itemId);
        item.setItemStatus(OrderItemStatus.DIGITAL_UNLOCKED);
        orderItemRepository.save(item);

        // Recalc needed: digital-only orders go from PAID → FULFILLED here
        recalcOrderStatus(orderId);
    }

    @Override
    @Transactional
    public void markOrderItemShipped(UUID orderId, UUID itemId) {

        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Item not found"));

        // 🛑 Guard check — ако е вече DELIVERED, НИКОГА не връщай обратно!
        if (item.getItemStatus() == OrderItemStatus.DELIVERED) {
            return; // 👌 игнорираме event-а
        }

        item.setItemStatus(OrderItemStatus.SHIPPED);
        orderItemRepository.save(item);

        recalcOrderStatus(orderId);
    }



    @Override
    @Transactional
    public void cancelOrderItem(UUID orderId, UUID itemId) {
        OrderItem item = getValidatedOrderItem(orderId, itemId);
        item.setItemStatus(OrderItemStatus.CANCELLED);
        orderItemRepository.save(item);

        // Recalc needed: order might become FULFILLED if all items cancelled
        recalcOrderStatus(orderId);
    }

    // ============================================================
    // BATCH OPERATIONS FOR DELIVERY
    // ============================================================

    @Override
    @Transactional
    public void markOrderItemsDelivered(UUID orderId, List<UUID> itemIds) {
        if (itemIds == null || itemIds.isEmpty()) {
            return;
        }

        log.info("📦 Marking {} items as DELIVERED for order {}", itemIds.size(), orderId);

        // Fetch all items once
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);

        // Update only the delivered items
        items.stream()
                .filter(item -> itemIds.contains(item.getId()))
                .forEach(item -> {
                    item.setItemStatus(OrderItemStatus.DELIVERED); // Then delivered
                });

        orderItemRepository.saveAll(items);

        // Recalculate order status ONCE after all items are updated
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
                .map(order -> DtoMappers.mapToOrderPreviewDTO(order, itemsByOrderId.get(order.getId())))
                .toList();

        // 6. Calculate total spent amount
        Double totalSpent = orderRepository.calculateTotalSpentByUser(userId);

        return UserOrderSummaryDTO.builder()
                .totalOrders(totalOrders)
                .recentOrders(recentOrderDTOs)
                .totalSpent(totalSpent != null ? totalSpent : 0.0)
                .build();
    }

    @Override
    @Transactional
    public void updateOrderTracking(UUID orderId, String trackingNumber) {

        if (trackingNumber == null || trackingNumber.isBlank()) {
            throw new IllegalArgumentException("Tracking number cannot be empty");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderId));

        order.setTrackingNumber(trackingNumber);

        orderRepository.save(order);

        log.info("🚚 Tracking number '{}' set for order {}", trackingNumber, orderId);
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

    @Transactional
    public void recalcOrderStatus(UUID orderId) {

        Order order = getOrderEntity(orderId);
        List<OrderItem> items = getOrderItemEntities(orderId);

        // Finished = напълно приключили
        boolean allFinished = items.stream().allMatch(i ->
                i.getItemStatus() == OrderItemStatus.DIGITAL_UNLOCKED ||
                        i.getItemStatus() == OrderItemStatus.DELIVERED ||
                        i.getItemStatus() == OrderItemStatus.CANCELLED
        );

        // Has progress = поне едно е изпълнено (digital unlocked или delivered)
        boolean anyFinished = items.stream().anyMatch(i ->
                i.getItemStatus() == OrderItemStatus.DIGITAL_UNLOCKED ||
                        i.getItemStatus() == OrderItemStatus.DELIVERED
        );

        // Has active items = някой е още PAID, PENDING или SHIPPED
        boolean anyActive = items.stream().anyMatch(i ->
                i.getItemStatus() == OrderItemStatus.PAID ||
                        i.getItemStatus() == OrderItemStatus.PENDING ||
                        i.getItemStatus() == OrderItemStatus.SHIPPED
        );

    /*
        Логика:
        - Ако всичко е приключено → FULFILLED
        - Ако има комбинация finished + active → PARTIALLY_FULFILLED
        - Ако няма finished, но има active → PAID (или остава текущото)
     */

        if (allFinished) {
            order.setStatus(OrderStatus.FULFILLED);
        }
        else if (anyFinished && anyActive) {
            order.setStatus(OrderStatus.PARTIALLY_FULFILLED);
        }
        // ако няма finished, но има active → order = PAID
        // (status не се променя автоматично, оставя се този който е)
        // напр. digital-only поръчка ще е PAID докато main app не отключи дигиталните
        else if (!anyFinished && anyActive) {
            order.setStatus(OrderStatus.PAID);
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

    @Override
    public List<Order> findPendingOrdersOlderThanMinutes(int minutes) {
        OffsetDateTime threshold = OffsetDateTime.now().minusMinutes(minutes);
        return orderRepository.findByStatusAndCreatedAtBefore(OrderStatus.PENDING, threshold);
    }

}
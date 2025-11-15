package bg.softuni.stylemint.orderservice.service;

import bg.softuni.stylemint.orderservice.dto.*;
import bg.softuni.stylemint.orderservice.model.Order;
import bg.softuni.stylemint.orderservice.model.OrderItem;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    // CREATE
    CreateOrderResponseDTO createOrder(CreateOrderRequestDTO request);

    // LOOKUP (DTO)
    OrderDTO getOrder(UUID orderId);
    List<OrderItemDTO> getOrderItems(UUID orderId);
    OrderStatusDTO getOrderStatus(UUID orderId);

    // USER SUMMARY
    //long countOrdersByUser(UUID userId);
    UserOrderSummaryDTO getUserOrderSummary(UUID userId);

    // INTERNAL ENTITY METHODS (webhook и service-логика)
    Order getOrderEntity(UUID orderId);
    List<OrderItem> getOrderItemEntities(UUID orderId);

    // ORDER LEVEL STATUS
    void markOrderAsPaid(UUID orderId);
    void markOrderAsFailed(UUID orderId);
    void markOrderAsCancelled(UUID orderId);
    void markOrderAsFulfilled(UUID orderId);

    // ITEM LEVEL STATUS
    void markOrderItemDigitalUnlocked(UUID orderId, UUID itemId);
    void markOrderItemShipped(UUID orderId, UUID itemId);
    void markOrderItemDelivered(UUID orderId, UUID itemId);
    void cancelOrderItem(UUID orderId, UUID itemId);


    //PSEUDO DELIVERY STATUS
    void markOrderItemShippedForAll(UUID orderId);
    void markOrderItemDeliveredForAll(UUID orderId);
    boolean containsClothes(UUID orderId);
    boolean containsDigitalAssets(UUID orderId);
    List<OrderItem> getClothingItems(UUID orderId);
}

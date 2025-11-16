package bg.softuni.stylemint.orderservice.order.helpers;


import bg.softuni.dtos.order.OrderDTO;
import bg.softuni.dtos.order.OrderItemDTO;
import bg.softuni.dtos.order.OrderPreviewDTO;
import bg.softuni.stylemint.orderservice.order.model.Order;
import bg.softuni.stylemint.orderservice.order.model.OrderItem;

import java.util.List;

public class DtoMappers {

    // ============================================================
    // DTO MAPPERS
    // ============================================================

    public static OrderDTO toOrderDTO(Order order, List<OrderItem> items) {
        return OrderDTO.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .deliveryAddress(order.getDeliveryAddress())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .items(items.stream().map(DtoMappers::toItemDTO).toList())
                .build();
    }

    public static OrderItemDTO toItemDTO(OrderItem item) {
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

    public static OrderPreviewDTO mapToOrderPreviewDTO(Order order, List<OrderItem> orderItems) {
        if (orderItems == null) {
            orderItems = List.of();
        }

        List<OrderItemDTO> itemDTOs = orderItems.stream()
                .map(DtoMappers::toItemDTO)  // Използваме вече съществуващия метод
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


}
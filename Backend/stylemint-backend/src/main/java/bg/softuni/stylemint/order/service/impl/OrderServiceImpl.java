package bg.softuni.stylemint.order.service.impl;

import bg.softuni.stylemint.order.dto.OrderItemDTO;
import bg.softuni.stylemint.order.dto.OrderPreviewDTO;
import bg.softuni.stylemint.order.dto.UserOrderSummaryDTO;
import bg.softuni.stylemint.order.model.Order;
import bg.softuni.stylemint.order.model.OrderItem;
import bg.softuni.stylemint.order.repository.OrderRepository;
import bg.softuni.stylemint.order.repository.OrderItemRepository;
import bg.softuni.stylemint.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public long countOrdersByUser(UUID userId) {
        return orderRepository.countByUserId(userId);
    }

    @Override
    public UserOrderSummaryDTO getUserOrderSummary(UUID userId) {
        // 1. Брой на всички поръчки
        Long totalOrders = orderRepository.countByUserId(userId);

        // 2. Последните 10 поръчки
        Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Order> recentOrders = orderRepository.findByUserId(userId, pageable);

        // 3. Вземаме всички items за тези поръчки наведнъж (оптимизация)
        List<UUID> orderIds = recentOrders.stream()
                .map(Order::getId)
                .toList();

        List<OrderItem> allItems = orderItemRepository.findByOrderIdIn(orderIds);

        // 4. Групираме items по orderId
        Map<UUID, List<OrderItem>> itemsByOrderId = allItems.stream()
                .collect(Collectors.groupingBy(item -> item.getOrder().getId()));

        // 5. Маппинг към OrderPreviewDTO
        List<OrderPreviewDTO> recentOrderDTOs = recentOrders.stream()
                .map(order -> mapToOrderPreviewDTO(order, itemsByOrderId.get(order.getId())))
                .toList();

        // 6. Изчисляване на обща харчена сума
        Double totalSpent = orderRepository.calculateTotalSpentByUser(userId);

        return UserOrderSummaryDTO.builder()
                .totalOrders(totalOrders)
                .recentOrders(recentOrderDTOs)
                .totalSpent(totalSpent != null ? totalSpent : 0.0)
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

    private OrderItemDTO mapToOrderItemDTO(OrderItem item) {
        return OrderItemDTO.builder()
                .itemId(item.getId())
                .productType(item.getProductType())
                .productId(item.getProductId())
                .quantity(item.getQuantity())
                .pricePerUnit(item.getPricePerUnit())
                .customizationJson(item.getCustomizationJson())
                .build();
    }
}
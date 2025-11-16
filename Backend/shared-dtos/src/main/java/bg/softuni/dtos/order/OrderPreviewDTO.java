package bg.softuni.dtos.order;

import bg.softuni.dtos.enums.order.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Minimal DTO for a short overview of an order.
 * Used in UserOrderSummaryDTO and other list views.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderPreviewDTO {
    private UUID orderId;
    private OrderStatus status;
    private Double totalAmount;
    private OffsetDateTime createdAt;
    private List<OrderItemDTO> items;
}
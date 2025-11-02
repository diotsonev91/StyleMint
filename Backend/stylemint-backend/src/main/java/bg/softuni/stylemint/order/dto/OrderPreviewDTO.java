package bg.softuni.stylemint.order.dto;

import bg.softuni.stylemint.order.enums.OrderStatus;
import bg.softuni.stylemint.order.enums.ProductType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Минимален DTO за кратък преглед на поръчка.
 * Използва се в UserOrderSummaryDTO и други list view-и.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderPreviewDTO {
    private UUID orderId;
    private ProductType productType;
    private OrderStatus status;
    private Double amount;
    private OffsetDateTime createdAt;
}

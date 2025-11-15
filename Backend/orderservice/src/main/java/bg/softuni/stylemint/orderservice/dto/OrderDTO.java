package bg.softuni.stylemint.orderservice.dto;
import bg.softuni.stylemint.orderservice.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderDTO {
    private UUID orderId;
    private UUID userId;
    private String deliveryAddress;
    private OrderStatus status;
    private Double totalAmount;
    private OffsetDateTime createdAt;
    private List<OrderItemDTO> items;
}

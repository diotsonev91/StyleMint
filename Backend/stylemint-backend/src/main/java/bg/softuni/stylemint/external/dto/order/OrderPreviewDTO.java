// File: OrderPreviewDTO.java (in orchestrator)
package bg.softuni.stylemint.external.dto.order;

import bg.softuni.stylemint.external.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

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
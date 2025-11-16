package bg.softuni.dtos.order;

import bg.softuni.dtos.enums.order.OrderStatus;
import lombok.*;

@Data
@AllArgsConstructor
public class OrderStatusDTO {
    private OrderStatus status;
}

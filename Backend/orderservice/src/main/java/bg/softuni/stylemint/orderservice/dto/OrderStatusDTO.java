package bg.softuni.stylemint.orderservice.dto;

import bg.softuni.stylemint.orderservice.enums.OrderStatus;
import lombok.*;

@Data
@AllArgsConstructor
public class OrderStatusDTO {
    private OrderStatus status;
}

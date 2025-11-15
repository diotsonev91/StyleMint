package bg.softuni.stylemint.orderservice.dto;

import bg.softuni.stylemint.orderservice.enums.PaymentMethod;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequestDTO {

    private UUID userId;

    private List<OrderItemRequestDTO> items;

    private PaymentMethod paymentMethod;

    private String deliveryAddress; // null if not physical
}


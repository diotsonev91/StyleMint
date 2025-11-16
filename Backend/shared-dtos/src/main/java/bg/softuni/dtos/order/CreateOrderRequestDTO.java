package bg.softuni.dtos.order;


import bg.softuni.dtos.enums.payment.PaymentMethod;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequestDTO {

    private UUID userId;

    private List<OrderItemRequestDTO> items;

    private PaymentMethod paymentMethod;

    private String deliveryAddress;

    private String userName;

    private String userPhone;
}

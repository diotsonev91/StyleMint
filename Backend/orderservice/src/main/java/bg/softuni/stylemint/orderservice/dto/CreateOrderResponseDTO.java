package bg.softuni.stylemint.orderservice.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderResponseDTO {
    private UUID orderId;
    private Double totalAmount;
    private String paymentUrl; // only for Stripe, null for cash
    private String status;
}


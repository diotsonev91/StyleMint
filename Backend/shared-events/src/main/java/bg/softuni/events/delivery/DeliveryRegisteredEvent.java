package bg.softuni.events.delivery;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryRegisteredEvent {
    private UUID orderId;
    private UUID deliveryId;
    private String trackingNumber;
    private String courierName;
}
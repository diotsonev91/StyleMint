package bg.softuni.deliveryservice.external.dto;

import lombok.Data;

@Data
public class CourierWebhookRequest {
    private String trackingNumber;
    private String status;
    private String deliveredAt;
    private String courierNote;
}

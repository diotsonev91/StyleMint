package bg.softuni.events.delivery;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public class StartDeliveryEvent {
        private UUID orderId;
        private List<UUID> itemIds;
        private String deliveryAddress;
        private String customerName;
        private String customerPhone;
    }



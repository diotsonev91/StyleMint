package bg.softuni.stylemint.orderservice.delivery;

import bg.softuni.stylemint.orderservice.model.OrderItem;

import java.util.List;
import java.util.UUID;

public interface DeliveryService {
    void startDelivery(UUID orderId, List<OrderItem> clothesItems);
}

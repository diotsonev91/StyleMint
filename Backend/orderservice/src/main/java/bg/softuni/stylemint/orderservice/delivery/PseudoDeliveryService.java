package bg.softuni.stylemint.orderservice.delivery;

import bg.softuni.stylemint.orderservice.model.OrderItem;
import bg.softuni.stylemint.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PseudoDeliveryService implements DeliveryService {

    private final OrderService orderService;

    @Async
    @Override
    public void startDelivery(UUID orderId, List<OrderItem> clothesItems) {
        log.info("🚚 Starting delivery for {} clothing items (order {})",
                clothesItems.size(), orderId);

        try {
            Thread.sleep(5000); // симулация
        } catch (InterruptedException ignore) {}

        // маркираме само дрехите като SHIPPED → DELIVERED
        clothesItems.forEach(item -> {
            orderService.markOrderItemShipped(orderId, item.getId());
            orderService.markOrderItemDelivered(orderId, item.getId());
        });

        log.info("📦 Delivery finished for order {}", orderId);
    }
}

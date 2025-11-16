package bg.softuni.stylemint.orderservice.order.schedule;

import bg.softuni.stylemint.orderservice.order.model.Order;
import bg.softuni.stylemint.orderservice.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCleanupScheduler {

    private final OrderService orderService;

    /**
     * Runs every 30 minutes.
     * Cancels orders that are still PENDING and older than 30 minutes.
     */
    @Scheduled(fixedRate = 30 * 60 * 1000) // every 30 minutes
    public void cancelStalePendingOrders() {

        int minutes = 30;

        List<Order> staleOrders =
                orderService.findPendingOrdersOlderThanMinutes(minutes);

        if (staleOrders.isEmpty()) {
            return;
        }

        log.warn("⏳ Found {} stale PENDING orders older than {} minutes. Cancelling...",
                staleOrders.size(), minutes);

        for (Order order : staleOrders) {
            log.info("❌ Auto-cancelling stale order {}", order.getId());
            orderService.markOrderAsCancelled(order.getId());
        }
    }
}

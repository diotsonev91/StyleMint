package bg.softuni.stylemint.orderservice.integration;

import bg.softuni.dtos.enums.order.OrderStatus;
import bg.softuni.dtos.enums.payment.PaymentMethod;
import bg.softuni.stylemint.orderservice.order.model.Order;
import bg.softuni.stylemint.orderservice.order.repository.OrderRepository;
import bg.softuni.stylemint.orderservice.order.schedule.OrderCleanupScheduler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;


import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;


@SpringBootTest(properties = "spring.profiles.active=test")
@AutoConfigureTestDatabase
class OrderCleanupSchedulerTest {

    @Autowired
    OrderCleanupScheduler scheduler;

    @Autowired
    OrderRepository orderRepo;

    @Test
    void cleanupOldPendingOrders_ShouldMarkThemCanceled() {
        Order old = Order.builder()
                .status(OrderStatus.PENDING)
                .totalAmount(10.0)
                .paymentMethod(PaymentMethod.STRIPE)
                .userId(UUID.randomUUID())
                .build();

        old = orderRepo.save(old);

        // 🔥 След save — задаваме createdAt ръчно с native update
        old.setCreatedAt(OffsetDateTime.now().minusMinutes(61));
        orderRepo.save(old);

        scheduler.cancelStalePendingOrders();

        Order updated = orderRepo.findById(old.getId()).get();
        assertEquals(OrderStatus.CANCELLED, updated.getStatus());
    }

}

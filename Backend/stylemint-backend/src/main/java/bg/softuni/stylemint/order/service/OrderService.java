package bg.softuni.stylemint.order.service;

import java.util.UUID;

public interface OrderService {
    long countOrdersByUser(UUID userId);
}

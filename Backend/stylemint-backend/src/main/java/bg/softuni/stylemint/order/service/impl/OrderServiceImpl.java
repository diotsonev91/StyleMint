package bg.softuni.stylemint.order.service.impl;

import bg.softuni.stylemint.order.repository.OrderRepository;
import bg.softuni.stylemint.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    @Override
    public long countOrdersByUser(UUID userId) {
        return orderRepository.countByUserId(userId);
    }
}

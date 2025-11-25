package bg.softuni.stylemint.orderservice.payment.service;


import bg.softuni.dtos.order.CreateOrderRequestDTO;
import bg.softuni.stylemint.orderservice.order.model.Order;
import bg.softuni.stylemint.orderservice.order.model.OrderItem;

import java.util.List;

public interface PaymentService {
    PaymentResult initiatePayment(Order order, List<OrderItem> items, String frontendUrl);
    void validatePaymentMethod(CreateOrderRequestDTO request);
}

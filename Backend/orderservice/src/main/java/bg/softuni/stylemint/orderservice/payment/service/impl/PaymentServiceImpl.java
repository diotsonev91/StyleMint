package bg.softuni.stylemint.orderservice.payment.service.impl;

import bg.softuni.dtos.enums.payment.PaymentMethod;
import bg.softuni.dtos.enums.payment.ProductType;
import bg.softuni.dtos.order.CreateOrderRequestDTO;
import bg.softuni.stylemint.orderservice.order.exceptions.MissingDeliveryAddressException;
import bg.softuni.stylemint.orderservice.order.model.Order;
import bg.softuni.stylemint.orderservice.order.model.OrderItem;
import bg.softuni.stylemint.orderservice.payment.exceptions.InvalidPaymentMethodException;
import bg.softuni.stylemint.orderservice.payment.service.PaymentResult;
import bg.softuni.stylemint.orderservice.payment.service.PaymentService;
import bg.softuni.stylemint.orderservice.payment.service.StripeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
@Slf4j



public class PaymentServiceImpl implements PaymentService {

    private final StripeService stripeService;

    @Override
    public void validatePaymentMethod(CreateOrderRequestDTO request) {

        boolean containsClothes = request.getItems().stream()
                .anyMatch(i -> i.getProductType() == ProductType.CLOTHES);

        boolean containsDigital = request.getItems().stream()
                .anyMatch(i -> i.getProductType() == ProductType.SAMPLE ||
                        i.getProductType() == ProductType.PACK);

        if (containsDigital && request.getPaymentMethod() == PaymentMethod.CASH) {
            throw new InvalidPaymentMethodException(
                    "Cash is only allowed for clothes. Digital items require Stripe payment.");
        }

        if (containsDigital && request.getPaymentMethod() != PaymentMethod.STRIPE) {
            throw new InvalidPaymentMethodException(
                    "Digital items require Stripe payment.");
        }

        if (containsClothes &&
                (request.getDeliveryAddress() == null || request.getDeliveryAddress().isBlank())) {
            throw new MissingDeliveryAddressException();
        }
    }

    @Override
    public PaymentResult initiatePayment(Order order, List<OrderItem> items) {

        if (order.getPaymentMethod() == PaymentMethod.CASH) {

            boolean hasClothes = items.stream()
                    .anyMatch(i -> i.getProductType() == ProductType.CLOTHES);

            return new PaymentResult(
                    true,   // is cash
                    true,   // should mark paid immediately (after delivery)
                    hasClothes,
                    null    // no payment URL
            );
        }

        // STRIPE
        String url = stripeService.createCheckoutSession(
                order.getTotalAmount(),
                order.getId(),
                "https://stylemint.com/payment/success?orderId=" + order.getId(),
                "https://stylemint.com/payment/cancel?orderId=" + order.getId()
        );

        return new PaymentResult(
                false,
                false,
                false,
                url
        );
    }
}



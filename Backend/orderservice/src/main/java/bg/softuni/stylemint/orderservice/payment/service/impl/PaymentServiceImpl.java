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
    public PaymentResult initiatePayment(Order order, List<OrderItem> items, String frontendUrl) {

        boolean hasClothes = items.stream()
                .anyMatch(i -> i.getProductType() == ProductType.CLOTHES);

        if (order.getPaymentMethod() == PaymentMethod.CASH) {
            return new PaymentResult(
                    true,   
                    hasClothes,
                    null
            );
        }

        String successUrl = frontendUrl + "/checkout/success?orderId=" + order.getId();
        String cancelUrl = frontendUrl + "/checkout/cancel?orderId=" + order.getId();

        log.info("🔗 Creating Stripe session with URLs:");
        log.info("   Success: {}", successUrl);
        log.info("   Cancel: {}", cancelUrl);

        String stripeCheckoutUrl = stripeService.createCheckoutSession(
                order.getTotalAmount(),
                order.getId(),
                successUrl,
                cancelUrl
        );

        return new PaymentResult(
                false,
                hasClothes,
                stripeCheckoutUrl
        );
    }
}



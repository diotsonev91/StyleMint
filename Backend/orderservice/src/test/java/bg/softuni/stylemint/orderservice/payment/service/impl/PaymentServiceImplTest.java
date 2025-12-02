package bg.softuni.stylemint.orderservice.payment.service.impl;

import bg.softuni.dtos.enums.order.OrderItemStatus;
import bg.softuni.dtos.enums.order.OrderStatus;
import bg.softuni.dtos.enums.payment.PaymentMethod;
import bg.softuni.dtos.enums.payment.ProductType;
import bg.softuni.dtos.order.CreateOrderRequestDTO;
import bg.softuni.dtos.order.OrderItemRequestDTO;
import bg.softuni.stylemint.orderservice.order.exceptions.MissingDeliveryAddressException;
import bg.softuni.stylemint.orderservice.order.model.Order;
import bg.softuni.stylemint.orderservice.order.model.OrderItem;
import bg.softuni.stylemint.orderservice.payment.exceptions.InvalidPaymentMethodException;
import bg.softuni.stylemint.orderservice.payment.service.PaymentResult;
import bg.softuni.stylemint.orderservice.payment.service.StripeService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private StripeService stripeService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    // ---------------------------------------------------------
    // validatePaymentMethod
    // ---------------------------------------------------------

    @Test
    void validatePaymentMethod_digitalWithCash_throwsInvalidPaymentMethod() {
        OrderItemRequestDTO digital = OrderItemRequestDTO.builder()
                .productType(ProductType.SAMPLE)
                .productId(UUID.randomUUID())
                .quantity(1)
                .pricePerUnit(10.0)
                .build();

        CreateOrderRequestDTO request = new CreateOrderRequestDTO(
                UUID.randomUUID(),
                List.of(digital),
                PaymentMethod.CASH,
                null,
                "User",
                "Phone"
        );

        assertThrows(InvalidPaymentMethodException.class,
                () -> paymentService.validatePaymentMethod(request));
    }

    @Test
    void validatePaymentMethod_digitalWithNonStripe_throwsInvalidPaymentMethod() {
        OrderItemRequestDTO digital = OrderItemRequestDTO.builder()
                .productType(ProductType.PACK)
                .productId(UUID.randomUUID())
                .quantity(1)
                .pricePerUnit(10.0)
                .build();

        CreateOrderRequestDTO request = new CreateOrderRequestDTO(
                UUID.randomUUID(),
                List.of(digital),
                PaymentMethod.CASH, // всякакво, различно от STRIPE
                null,
                "User",
                "Phone"
        );

        assertThrows(InvalidPaymentMethodException.class,
                () -> paymentService.validatePaymentMethod(request));
    }

    @Test
    void validatePaymentMethod_clothesWithMissingAddress_throwsMissingDeliveryAddress() {
        OrderItemRequestDTO clothes = OrderItemRequestDTO.builder()
                .productType(ProductType.CLOTHES)
                .productId(UUID.randomUUID())
                .quantity(1)
                .pricePerUnit(50.0)
                .build();

        CreateOrderRequestDTO request = new CreateOrderRequestDTO(
                UUID.randomUUID(),
                List.of(clothes),
                PaymentMethod.CASH,
                "   ", // празен адрес
                "User",
                "Phone"
        );

        assertThrows(MissingDeliveryAddressException.class,
                () -> paymentService.validatePaymentMethod(request));
    }

    @Test
    void validatePaymentMethod_digitalStripeAndClothesWithAddress_ok() {
        OrderItemRequestDTO digital = OrderItemRequestDTO.builder()
                .productType(ProductType.SAMPLE)
                .productId(UUID.randomUUID())
                .quantity(1)
                .pricePerUnit(10.0)
                .build();

        OrderItemRequestDTO clothes = OrderItemRequestDTO.builder()
                .productType(ProductType.CLOTHES)
                .productId(UUID.randomUUID())
                .quantity(1)
                .pricePerUnit(50.0)
                .build();

        CreateOrderRequestDTO request = new CreateOrderRequestDTO(
                UUID.randomUUID(),
                List.of(digital, clothes),
                PaymentMethod.STRIPE,
                "Some Address",
                "User",
                "Phone"
        );

        assertDoesNotThrow(() -> paymentService.validatePaymentMethod(request));
    }

    // ---------------------------------------------------------
    // initiatePayment
    // ---------------------------------------------------------

    @Test
    void initiatePayment_cashOnDelivery_returnsCashResultWithoutCallingStripe() {
        UUID orderId = UUID.randomUUID();

        Order order = Order.builder()
                .id(orderId)
                .userId(UUID.randomUUID())
                .status(OrderStatus.PENDING)
                .paymentMethod(PaymentMethod.CASH)
                .totalAmount(100.0)
                .createdAt(OffsetDateTime.now())
                .build();

        OrderItem clothes = OrderItem.builder()
                .id(UUID.randomUUID())
                .order(order)
                .productType(ProductType.CLOTHES)
                .productId(UUID.randomUUID())
                .quantity(1)
                .pricePerUnit(100.0)
                .itemStatus(OrderItemStatus.PENDING)
                .build();

        List<OrderItem> items = List.of(clothes);

        PaymentResult result = paymentService.initiatePayment(order, items, "http://localhost:5173");

        assertTrue(result.isCashOnDelivery());
        assertTrue(result.shouldDeliverClothes());
        assertNull(result.paymentUrl());

        verifyNoInteractions(stripeService);
    }

    @Test
    void initiatePayment_stripePayment_callsStripeServiceAndReturnsPaymentUrl() {
        UUID orderId = UUID.randomUUID();

        Order order = Order.builder()
                .id(orderId)
                .userId(UUID.randomUUID())
                .status(OrderStatus.PENDING)
                .paymentMethod(PaymentMethod.STRIPE)
                .totalAmount(150.0)
                .createdAt(OffsetDateTime.now())
                .build();

        OrderItem digitalItem = OrderItem.builder()
                .id(UUID.randomUUID())
                .order(order)
                .productType(ProductType.SAMPLE)
                .productId(UUID.randomUUID())
                .quantity(1)
                .pricePerUnit(150.0)
                .itemStatus(OrderItemStatus.PENDING)
                .build();

        List<OrderItem> items = List.of(digitalItem);

        when(stripeService.createCheckoutSession(anyDouble(), eq(orderId), anyString(), anyString()))
                .thenReturn("https://stripe.test/checkout");

        PaymentResult result = paymentService.initiatePayment(order, items, "http://frontend");

        assertFalse(result.isCashOnDelivery());
        assertFalse(result.shouldDeliverClothes());
        assertEquals("https://stripe.test/checkout", result.paymentUrl());

        verify(stripeService, times(1))
                .createCheckoutSession(eq(150.0), eq(orderId),
                        eq("http://frontend/checkout/success?orderId=" + orderId),
                        eq("http://frontend/checkout/cancel?orderId=" + orderId));
    }
}

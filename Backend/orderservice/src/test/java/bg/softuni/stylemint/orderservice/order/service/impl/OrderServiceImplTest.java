package bg.softuni.stylemint.orderservice.order.service.impl;

import bg.softuni.dtos.enums.order.OrderItemStatus;
import bg.softuni.dtos.enums.order.OrderStatus;
import bg.softuni.dtos.enums.payment.ProductType;
import bg.softuni.dtos.enums.payment.PaymentMethod;
import bg.softuni.dtos.order.CreateOrderRequestDTO;
import bg.softuni.dtos.order.CreateOrderResponseDTO;
import bg.softuni.dtos.order.OrderItemRequestDTO;
import bg.softuni.stylemint.orderservice.order.model.Order;
import bg.softuni.stylemint.orderservice.order.model.OrderItem;
import bg.softuni.stylemint.orderservice.order.repository.OrderItemRepository;
import bg.softuni.stylemint.orderservice.order.repository.OrderRepository;
import bg.softuni.stylemint.orderservice.outbox.enums.OutboxEventType;
import bg.softuni.stylemint.orderservice.outbox.model.OutboxEvent;
import bg.softuni.stylemint.orderservice.outbox.repository.OutboxEventRepository;
import bg.softuni.stylemint.orderservice.payment.service.PaymentResult;
import bg.softuni.stylemint.orderservice.payment.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.OffsetDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private PaymentService paymentService;

    @Mock
    private OutboxEventRepository outboxEventRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    private UUID userId;
    private UUID orderId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        orderId = UUID.randomUUID();

        // да има валиден frontendUrl вместо null
        ReflectionTestUtils.setField(orderService, "frontendUrl", "http://localhost:5173");
    }

    // ---------------------------------------------------------
    // createOrder
    // ---------------------------------------------------------

    @Test
    void createOrder_withDigitalItemsStripePayment_persistsOrderItems_andCallsPaymentService() {
        // arrange
        OrderItemRequestDTO itemReq = OrderItemRequestDTO.builder()
                .productType(ProductType.SAMPLE)
                .productId(UUID.randomUUID())
                .quantity(2)
                .pricePerUnit(10.0)
                .customizationJson(null)
                .build();

        CreateOrderRequestDTO request = new CreateOrderRequestDTO(
                userId,
                List.of(itemReq),
                PaymentMethod.STRIPE,
                "Some Address",
                "User Name",
                "+35988123456"
        );

        // stub save(order) да сетне ID
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(orderId);
            return o;
        });

        // saveAll за items – просто върни списъка
        when(orderItemRepository.saveAll(anyCollection()))
                .thenAnswer(invocation -> new ArrayList<>((Collection<OrderItem>) invocation.getArgument(0)));

        PaymentResult paymentResult = new PaymentResult(
                false, // isCashOnDelivery
                false, // shouldDeliverClothes
                "https://stripe.test/checkout-session"
        );

        when(paymentService.initiatePayment(any(Order.class), anyList(), anyString()))
                .thenReturn(paymentResult);

        // act
        CreateOrderResponseDTO response = orderService.createOrder(request);

        // assert
        verify(paymentService).validatePaymentMethod(request);
        verify(orderRepository, times(1)).save(any(Order.class));
        verify(orderItemRepository, times(1)).saveAll(anyCollection());
        verify(paymentService, times(1))
                .initiatePayment(any(Order.class), anyList(), eq("http://localhost:5173"));

        assertNotNull(response);
        assertEquals(orderId, response.getOrderId());
        assertEquals(20.0, response.getTotalAmount()); // 2 * 10.0
        assertEquals("https://stripe.test/checkout-session", response.getPaymentUrl());
        assertEquals(OrderStatus.PENDING.name(), response.getStatus());
    }

    // ---------------------------------------------------------
    // saveDeliveryOutboxEvent
    // ---------------------------------------------------------

    @Test
    void saveDeliveryOutboxEvent_persistsOutboxEventWithCorrectFields() {
        // arrange
        UUID itemId = UUID.randomUUID();

        Order order = Order.builder()
                .id(orderId)
                .userId(userId)
                .status(OrderStatus.PENDING)
                .paymentMethod(PaymentMethod.STRIPE)
                .totalAmount(100.0)
                .createdAt(OffsetDateTime.now())
                .build();

        OrderItem item = OrderItem.builder()
                .id(itemId)
                .order(order)
                .productType(ProductType.CLOTHES)
                .productId(UUID.randomUUID())
                .quantity(1)
                .pricePerUnit(100.0)
                .itemStatus(OrderItemStatus.PENDING)
                .build();

        List<OrderItem> clothesItems = List.of(item);

        // минимален request
        bg.softuni.dtos.order.CreateOrderRequestDTO request =
                new bg.softuni.dtos.order.CreateOrderRequestDTO(
                        userId,
                        List.of(),
                        PaymentMethod.CASH,
                        "Address",
                        "User",
                        "Phone"
                );

        ArgumentCaptor<OutboxEvent> captor = ArgumentCaptor.forClass(OutboxEvent.class);

        // act
        orderService.saveDeliveryOutboxEvent(orderId, clothesItems, request, OutboxEventType.START_DELIVERY);

        // assert
        verify(outboxEventRepository).save(captor.capture());

        OutboxEvent saved = captor.getValue();
        assertEquals(orderId, saved.getOrderId());
        assertEquals(OutboxEventType.START_DELIVERY, saved.getEventType());
        assertFalse(saved.isProcessed());
        assertNotNull(saved.getPayloadJson());
        assertNotNull(saved.getCreatedAt());
    }

    // ---------------------------------------------------------
    // markOrderAsPaid + recalcOrderStatus
    // ---------------------------------------------------------

    @Test
    void markOrderAsPaid_marksDigitalItemsPaid_skipsClothesAndAlreadyUnlocked_andRecalculatesStatus() {
        // arrange
        Order order = Order.builder()
                .id(orderId)
                .userId(userId)
                .status(OrderStatus.PENDING)
                .paymentMethod(PaymentMethod.STRIPE)
                .totalAmount(100.0)
                .createdAt(OffsetDateTime.now())
                .build();

        OrderItem clothesItem = OrderItem.builder()
                .id(UUID.randomUUID())
                .order(order)
                .productType(ProductType.CLOTHES)
                .productId(UUID.randomUUID())
                .quantity(1)
                .pricePerUnit(50.0)
                .itemStatus(OrderItemStatus.PENDING)
                .build();

        OrderItem digitalPending = OrderItem.builder()
                .id(UUID.randomUUID())
                .order(order)
                .productType(ProductType.SAMPLE)
                .productId(UUID.randomUUID())
                .quantity(1)
                .pricePerUnit(50.0)
                .itemStatus(OrderItemStatus.PENDING)
                .build();

        OrderItem digitalUnlocked = OrderItem.builder()
                .id(UUID.randomUUID())
                .order(order)
                .productType(ProductType.PACK)
                .productId(UUID.randomUUID())
                .quantity(1)
                .pricePerUnit(0.0)
                .itemStatus(OrderItemStatus.DIGITAL_UNLOCKED)
                .build();

        List<OrderItem> items = List.of(clothesItem, digitalPending, digitalUnlocked);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderItemRepository.findByOrderId(orderId)).thenReturn(items);

        // saveAll да върне същия списък
        when(orderItemRepository.saveAll(anyCollection()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // act
        orderService.markOrderAsPaid(orderId);

        // assert
        assertEquals(OrderItemStatus.PENDING, clothesItem.getItemStatus(), "Clothes item should stay PENDING");
        assertEquals(OrderItemStatus.PAID, digitalPending.getItemStatus(), "Digital PENDING item should become PAID");
        assertEquals(OrderItemStatus.DIGITAL_UNLOCKED, digitalUnlocked.getItemStatus(), "Already unlocked stays so");

        // recalcOrderStatus трябва да е сложил PARTIALLY_FULFILLED (finished + active)
        assertEquals(OrderStatus.PARTIALLY_FULFILLED, order.getStatus());

        verify(orderItemRepository).saveAll(items);
        verify(orderRepository, atLeastOnce()).save(order);
    }

    // ---------------------------------------------------------
    // markOrderItemShipped
    // ---------------------------------------------------------

    @Test
    void markOrderItemShipped_doesNothingWhenAlreadyDelivered() {
        // arrange
        UUID itemId = UUID.randomUUID();

        OrderItem item = OrderItem.builder()
                .id(itemId)
                .order(Order.builder().id(orderId).build())
                .productType(ProductType.CLOTHES)
                .itemStatus(OrderItemStatus.DELIVERED)
                .build();

        when(orderItemRepository.findById(itemId)).thenReturn(Optional.of(item));

        // act
        orderService.markOrderItemShipped(orderId, itemId);

        // assert
        assertEquals(OrderItemStatus.DELIVERED, item.getItemStatus());
        // да не се запише и да не се пипа order
        verify(orderItemRepository, never()).save(any(OrderItem.class));
        verify(orderRepository, never()).save(any(Order.class));
    }

    // ---------------------------------------------------------
    // markOrderItemsDelivered
    // ---------------------------------------------------------

    @Test
    void markOrderItemsDelivered_updatesStatusesAndRecalculates() {
        // arrange
        UUID item1Id = UUID.randomUUID();
        UUID item2Id = UUID.randomUUID();
        UUID item3Id = UUID.randomUUID();

        Order order = Order.builder()
                .id(orderId)
                .status(OrderStatus.PAID)
                .build();

        OrderItem item1 = OrderItem.builder()
                .id(item1Id)
                .order(order)
                .itemStatus(OrderItemStatus.SHIPPED)
                .build();
        OrderItem item2 = OrderItem.builder()
                .id(item2Id)
                .order(order)
                .itemStatus(OrderItemStatus.SHIPPED)
                .build();
        OrderItem item3 = OrderItem.builder()
                .id(item3Id)
                .order(order)
                .itemStatus(OrderItemStatus.PENDING)
                .build();

        List<OrderItem> items = List.of(item1, item2, item3);

        when(orderItemRepository.findByOrderId(orderId)).thenReturn(items);
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderItemRepository.saveAll(anyCollection()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // act
        orderService.markOrderItemsDelivered(orderId, List.of(item1Id, item2Id));

        // assert – item1 и item2 -> DELIVERED, item3 остава PENDING
        assertEquals(OrderItemStatus.DELIVERED, item1.getItemStatus());
        assertEquals(OrderItemStatus.DELIVERED, item2.getItemStatus());
        assertEquals(OrderItemStatus.PENDING, item3.getItemStatus());

        // recalcOrderStatus ще опита да сложи PARTIALLY_FULFILLED
        assertEquals(OrderStatus.PARTIALLY_FULFILLED, order.getStatus());
    }

    // ---------------------------------------------------------
    // updateOrderTracking
    // ---------------------------------------------------------

    @Test
    void updateOrderTracking_throwsOnBlankTrackingNumber() {
        assertThrows(IllegalArgumentException.class,
                () -> orderService.updateOrderTracking(orderId, "  "));
    }

    @Test
    void updateOrderTracking_setsTrackingNumberAndSavesOrder() {
        // arrange
        Order order = Order.builder()
                .id(orderId)
                .status(OrderStatus.PAID)
                .build();

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        // act
        orderService.updateOrderTracking(orderId, "TRACK-1234");

        // assert
        assertEquals("TRACK-1234", order.getTrackingNumber());
        verify(orderRepository).save(order);
    }

    // ---------------------------------------------------------
    // containsClothes / containsDigitalAssets
    // ---------------------------------------------------------

    @Test
    void containsClothes_returnsTrueWhenAnyClothesItemExists() {
        Order order = Order.builder().id(orderId).build();
        OrderItem clothes = OrderItem.builder()
                .id(UUID.randomUUID())
                .order(order)
                .productType(ProductType.CLOTHES)
                .itemStatus(OrderItemStatus.PENDING)
                .build();

        when(orderItemRepository.findByOrderId(orderId))
                .thenReturn(List.of(clothes));

        assertTrue(orderService.containsClothes(orderId));
    }

    @Test
    void containsDigitalAssets_delegatesToRepository() {
        when(orderItemRepository.existsByOrderIdAndProductTypeIn(
                eq(orderId),
                anyList()
        )).thenReturn(true);

        assertTrue(orderService.containsDigitalAssets(orderId));
        verify(orderItemRepository).existsByOrderIdAndProductTypeIn(
                eq(orderId),
                eq(List.of(ProductType.SAMPLE, ProductType.PACK))
        );
    }

    // ---------------------------------------------------------
    // findPendingOrdersOlderThanMinutes
    // ---------------------------------------------------------

    @Test
    void findPendingOrdersOlderThanMinutes_usesCorrectStatusAndThreshold() {
        List<Order> expected = List.of(
                Order.builder().id(UUID.randomUUID()).status(OrderStatus.PENDING).build()
        );

        ArgumentCaptor<OffsetDateTime> captor = ArgumentCaptor.forClass(OffsetDateTime.class);
        when(orderRepository.findByStatusAndCreatedAtBefore(eq(OrderStatus.PENDING), any()))
                .thenReturn(expected);

        List<Order> result = orderService.findPendingOrdersOlderThanMinutes(30);

        assertEquals(expected, result);

        verify(orderRepository).findByStatusAndCreatedAtBefore(eq(OrderStatus.PENDING), captor.capture());
        OffsetDateTime threshold = captor.getValue();
        assertTrue(threshold.isBefore(OffsetDateTime.now().plusSeconds(1)));
    }
}

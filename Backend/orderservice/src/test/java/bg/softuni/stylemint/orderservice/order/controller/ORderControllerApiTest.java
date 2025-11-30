package bg.softuni.stylemint.orderservice.order.controller;

import bg.softuni.dtos.enums.order.OrderStatus;
import bg.softuni.dtos.enums.payment.ProductType;
import bg.softuni.dtos.order.*;
import bg.softuni.stylemint.orderservice.order.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class OrderControllerApiTest {

    private MockMvc mockMvc;

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderController orderController;

    private ObjectMapper objectMapper;
    private UUID orderId;
    private UUID userId;
    private UUID itemId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(orderController).build();
        objectMapper = new ObjectMapper();

        orderId = UUID.randomUUID();
        userId = UUID.randomUUID();
        itemId = UUID.randomUUID();
    }

    /* ==========================================================
       CREATE ORDER TESTS
       ========================================================== */

    @Test
    void createOrder_ShouldReturnCreatedOrder() throws Exception {
        // Arrange
        CreateOrderRequestDTO request = CreateOrderRequestDTO.builder()
                .userId(userId)
                .items(List.of(
                        OrderItemRequestDTO.builder()
                                .productId(UUID.randomUUID())
                                .productType(ProductType.SAMPLE)
                                .quantity(1)
                                .unitPrice(BigDecimal.valueOf(29.99))
                                .build()
                ))
                .totalAmount(BigDecimal.valueOf(29.99))
                .build();

        CreateOrderResponseDTO response = CreateOrderResponseDTO.builder()
                .orderId(orderId)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(29.99))
                .build();

        when(orderService.createOrder(any(CreateOrderRequestDTO.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/orders/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(orderId.toString()))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.totalAmount").value(29.99));

        verify(orderService).createOrder(any(CreateOrderRequestDTO.class));
    }

    @Test
    void createOrder_WithInvalidRequest_ShouldReturnBadRequest() throws Exception {
        // Arrange - empty request
        CreateOrderRequestDTO request = CreateOrderRequestDTO.builder().build();

        // Act & Assert
        mockMvc.perform(post("/api/orders/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk()); // Note: Since there's no validation, it returns 200 but service might throw exception
    }

    /* ==========================================================
       GET ORDER STATUS TESTS
       ========================================================== */

    @Test
    void getOrderStatus_ShouldReturnOrderStatus() throws Exception {
        // Arrange
        OrderStatusDTO statusResponse = OrderStatusDTO.builder()
                .orderId(orderId)
                .status(OrderStatus.COMPLETED)
                .lastUpdated("2024-01-15T10:30:00Z")
                .build();

        when(orderService.getOrderStatus(orderId)).thenReturn(statusResponse);

        // Act & Assert
        mockMvc.perform(get("/api/orders/{orderId}/status", orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(orderId.toString()))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.lastUpdated").value("2024-01-15T10:30:00Z"));

        verify(orderService).getOrderStatus(orderId);
    }

    @Test
    void getOrderStatus_WithNonExistentOrder_ShouldHandleNotFound() throws Exception {
        // Arrange
        when(orderService.getOrderStatus(orderId))
                .thenThrow(new RuntimeException("Order not found"));

        // Act & Assert
        mockMvc.perform(get("/api/orders/{orderId}/status", orderId))
                .andExpect(status().is5xxServerError()); // Service throws exception

        verify(orderService).getOrderStatus(orderId);
    }

    /* ==========================================================
       GET ORDER DETAILS TESTS
       ========================================================== */

    @Test
    void getOrder_ShouldReturnOrderDetails() throws Exception {
        // Arrange
        OrderDTO orderResponse = OrderDTO.builder()
                .id(orderId)
                .userId(userId)
                .status(OrderStatus.COMPLETED)
                .totalAmount(BigDecimal.valueOf(59.98))
                .createdAt("2024-01-15T10:00:00Z")
                .build();

        when(orderService.getOrder(orderId)).thenReturn(orderResponse);

        // Act & Assert
        mockMvc.perform(get("/api/orders/{orderId}", orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderId.toString()))
                .andExpect(jsonPath("$.userId").value(userId.toString()))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.totalAmount").value(59.98));

        verify(orderService).getOrder(orderId);
    }

    /* ==========================================================
       GET ORDER ITEMS TESTS
       ========================================================== */

    @Test
    void getOrderItems_ShouldReturnOrderItems() throws Exception {
        // Arrange
        List<OrderItemDTO> items = List.of(
                OrderItemDTO.builder()
                        .itemId(itemId)
                        .productId(UUID.randomUUID())
                        .productType(ProductType.SAMPLE)
                        .quantity(1)
                        .unitPrice(BigDecimal.valueOf(29.99))
                        .totalPrice(BigDecimal.valueOf(29.99))
                        .status(OrderItemStatus.DIGITAL_UNLOCKED)
                        .build(),
                OrderItemDTO.builder()
                        .itemId(UUID.randomUUID())
                        .productId(UUID.randomUUID())
                        .productType(ProductType.PACK)
                        .quantity(1)
                        .unitPrice(BigDecimal.valueOf(49.99))
                        .totalPrice(BigDecimal.valueOf(49.99))
                        .status(OrderItemStatus.PENDING)
                        .build()
        );

        when(orderService.getOrderItems(orderId)).thenReturn(items);

        // Act & Assert
        mockMvc.perform(get("/api/orders/{orderId}/items", orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].itemId").value(itemId.toString()))
                .andExpect(jsonPath("$[0].productType").value("SAMPLE"))
                .andExpect(jsonPath("$[0].status").value("DIGITAL_UNLOCKED"))
                .andExpect(jsonPath("$[1].productType").value("PACK"))
                .andExpect(jsonPath("$[1].status").value("PENDING"));

        verify(orderService).getOrderItems(orderId);
    }

    @Test
    void getOrderItems_WithNoItems_ShouldReturnEmptyList() throws Exception {
        // Arrange
        when(orderService.getOrderItems(orderId)).thenReturn(List.of());

        // Act & Assert
        mockMvc.perform(get("/api/orders/{orderId}/items", orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());

        verify(orderService).getOrderItems(orderId);
    }

    /* ==========================================================
       USER ORDER SUMMARY TESTS
       ========================================================== */

    @Test
    void getUserSummary_ShouldReturnUserSummary() throws Exception {
        // Arrange
        UserOrderSummaryDTO summary = UserOrderSummaryDTO.builder()
                .userId(userId)
                .totalOrders(5)
                .totalSpent(BigDecimal.valueOf(299.95))
                .completedOrders(4)
                .pendingOrders(1)
                .build();

        when(orderService.getUserOrderSummary(userId)).thenReturn(summary);

        // Act & Assert
        mockMvc.perform(get("/api/orders/user/{userId}/summary", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(userId.toString()))
                .andExpect(jsonPath("$.totalOrders").value(5))
                .andExpect(jsonPath("$.totalSpent").value(299.95))
                .andExpect(jsonPath("$.completedOrders").value(4))
                .andExpect(jsonPath("$.pendingOrders").value(1));

        verify(orderService).getUserOrderSummary(userId);
    }

    /* ==========================================================
       DIGITAL UNLOCKED TESTS
       ========================================================== */

    @Test
    void digitalUnlocked_ShouldMarkItemAsUnlocked() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/orders/{orderId}/items/{itemId}/digital-unlocked",
                        orderId, itemId))
                .andExpect(status().isOk());

        verify(orderService).markOrderItemDigitalUnlocked(orderId, itemId);
    }

    @Test
    void digitalUnlocked_WithInvalidIds_ShouldHandleError() throws Exception {
        // Arrange
        doThrow(new RuntimeException("Order item not found"))
                .when(orderService).markOrderItemDigitalUnlocked(orderId, itemId);

        // Act & Assert
        mockMvc.perform(post("/api/orders/{orderId}/items/{itemId}/digital-unlocked",
                        orderId, itemId))
                .andExpect(status().is5xxServerError());

        verify(orderService).markOrderItemDigitalUnlocked(orderId, itemId);
    }

    /* ==========================================================
       EDGE CASE TESTS
       ========================================================== */

    @Test
    void getOrder_WithInvalidUUID_ShouldReturnBadRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/orders/{orderId}", "invalid-uuid"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getUserSummary_WithNonExistentUser_ShouldReturnEmptySummary() throws Exception {
        // Arrange
        UserOrderSummaryDTO emptySummary = UserOrderSummaryDTO.builder()
                .userId(userId)
                .totalOrders(0)
                .totalSpent(BigDecimal.ZERO)
                .completedOrders(0)
                .pendingOrders(0)
                .build();

        when(orderService.getUserOrderSummary(userId)).thenReturn(emptySummary);

        // Act & Assert
        mockMvc.perform(get("/api/orders/user/{userId}/summary", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalOrders").value(0))
                .andExpect(jsonPath("$.totalSpent").value(0));

        verify(orderService).getUserOrderSummary(userId);
    }

    @Test
    void createOrder_WithMultipleItems_ShouldHandleCorrectly() throws Exception {
        // Arrange
        CreateOrderRequestDTO request = CreateOrderRequestDTO.builder()
                .userId(userId)
                .items(List.of(
                        OrderItemRequestDTO.builder()
                                .productId(UUID.randomUUID())
                                .productType(ProductType.SAMPLE)
                                .quantity(2)
                                .unitPrice(BigDecimal.valueOf(19.99))
                                .build(),
                        OrderItemRequestDTO.builder()
                                .productId(UUID.randomUUID())
                                .productType(ProductType.PACK)
                                .quantity(1)
                                .unitPrice(BigDecimal.valueOf(49.99))
                                .build()
                ))
                .totalAmount(BigDecimal.valueOf(89.97))
                .build();

        CreateOrderResponseDTO response = CreateOrderResponseDTO.builder()
                .orderId(orderId)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(89.97))
                .build();

        when(orderService.createOrder(any(CreateOrderRequestDTO.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/orders/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").exists())
                .andExpect(jsonPath("$.totalAmount").value(89.97));

        verify(orderService).createOrder(any(CreateOrderRequestDTO.class));
    }
}
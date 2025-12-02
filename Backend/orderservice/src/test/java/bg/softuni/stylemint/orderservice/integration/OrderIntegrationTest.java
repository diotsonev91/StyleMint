package bg.softuni.stylemint.orderservice.integration;

import bg.softuni.dtos.enums.payment.PaymentMethod;
import bg.softuni.dtos.enums.payment.ProductType;
import bg.softuni.dtos.order.CreateOrderRequestDTO;
import bg.softuni.dtos.order.OrderItemRequestDTO;
import bg.softuni.stylemint.orderservice.order.model.Order;
import bg.softuni.stylemint.orderservice.order.model.OrderItem;
import bg.softuni.stylemint.orderservice.order.repository.OrderItemRepository;
import bg.softuni.stylemint.orderservice.order.repository.OrderRepository;
import bg.softuni.stylemint.orderservice.outbox.repository.OutboxEventRepository;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "spring.profiles.active=test")
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
class OrderIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository itemRepository;

    @Autowired
    private OutboxEventRepository outboxRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createOrder_FullFlow_PersistsOrderItemsAndOutbox() throws Exception {

        // ARRANGE
        UUID userId = UUID.randomUUID();

        OrderItemRequestDTO clothesItem = OrderItemRequestDTO.builder()
                .productType(ProductType.CLOTHES)
                .productId(UUID.randomUUID())
                .pricePerUnit(49.99)
                .quantity(1)
                .build();

        OrderItemRequestDTO digitalItem = OrderItemRequestDTO.builder()
                .productType(ProductType.SAMPLE)
                .productId(UUID.randomUUID())
                .pricePerUnit(19.99)
                .quantity(2)
                .build();

        CreateOrderRequestDTO request = new CreateOrderRequestDTO(
                userId,
                List.of(clothesItem, digitalItem),
                PaymentMethod.STRIPE,
                "Test Address",
                "John Doe",
                "0888123456"
        );

        // ACT — изпращаме реална HTTP заявка към OrderController
        String responseJson = mockMvc.perform(post("/api/orders/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // извличаме orderId
        String orderId = objectMapper.readTree(responseJson).get("orderId").asText();

        // ASSERT #1: Order записан в DB
        Order savedOrder = orderRepository.findById(UUID.fromString(orderId)).orElse(null);

        assertThat(savedOrder).isNotNull();
        assertThat(savedOrder.getUserId()).isEqualTo(userId);
        assertThat(savedOrder.getTotalAmount()).isEqualTo(49.99 + 2 * 19.99);
        assertThat(savedOrder.getStatus().name()).isEqualTo("PENDING");

        // ASSERT #2: Items записани в DB
        List<OrderItem> savedItems = itemRepository.findByOrderId(UUID.fromString(orderId));

        assertThat(savedItems).hasSize(2);

        boolean hasClothes = savedItems.stream().anyMatch(i -> i.getProductType() == ProductType.CLOTHES);
        boolean hasDigital = savedItems.stream().anyMatch(i -> i.getProductType() == ProductType.SAMPLE);

        assertThat(hasClothes).isTrue();
        assertThat(hasDigital).isTrue();

        // ASSERT #3: Outbox event трябва да е генериран (има дрехи → START_DELIVERY)
        assertThat(outboxRepository.findAll())
                .hasSize(1);

        assertThat(outboxRepository.findAll().get(0).getOrderId())
                .isEqualTo(savedOrder.getId());

        // ASSERT #4: Outbox processed=false
        assertThat(outboxRepository.findAll().get(0).isProcessed())
                .isFalse();
    }
}

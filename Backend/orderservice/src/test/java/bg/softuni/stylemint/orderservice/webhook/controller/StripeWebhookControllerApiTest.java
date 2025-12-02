package bg.softuni.stylemint.orderservice.webhook.controller;

import bg.softuni.stylemint.orderservice.webhook.service.WebhookHandlerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StripeWebhookController.class)
class StripeWebhookControllerApiTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WebhookHandlerService webhookHandlerService;

    @BeforeEach
    void setup() {
        // по желание: Mockito.reset(webhookHandlerService);
    }

    @Test
    void handleWebhook_ShouldCallService_AndReturn200() throws Exception {

        Mockito.doNothing().when(webhookHandlerService)
                .handleEvent(anyString(), anyString());

        mockMvc.perform(post("/")   // контролерът няма път → мапнат е на root (/)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"test\":true}")
                        .header("Stripe-Signature", "sig_123"))
                .andExpect(status().isOk())
                .andExpect(content().string("received"));

        Mockito.verify(webhookHandlerService, Mockito.times(1))
                .handleEvent(anyString(), anyString());
    }

    @Test
    void handleWebhook_MissingSignatureHeader_ShouldReturn400() throws Exception {

        mockMvc.perform(post("/")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"test\":true}"))
                .andExpect(status().is4xxClientError());
    }
}

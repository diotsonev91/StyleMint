package bg.softuni.stylemint.orderservice.webhook.controller;


import bg.softuni.stylemint.orderservice.webhook.service.WebhookHandlerService;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    private final WebhookHandlerService webhookHandlerService;

    @Value("${stripe.webhook-path}")
    private String webhookPath;

    @PostMapping
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {

        log.info("Webhook received at: {}", webhookPath); // Логване на пътя

        webhookHandlerService.handleEvent(payload, signature);
        return ResponseEntity.ok("received");
    }
}



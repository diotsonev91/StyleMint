package bg.softuni.stylemint.orderservice.webhook.controller;


import bg.softuni.stylemint.orderservice.webhook.service.WebhookHandlerService;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stripe/webhook")
@Slf4j
public class StripeWebhookController {

    private final WebhookHandlerService webhookHandlerService;

    @PostMapping
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {

        webhookHandlerService.handleEvent(payload, signature);
        return ResponseEntity.ok("received");
    }
}


package bg.softuni.stylemint.orderservice.webhook;

import bg.softuni.stylemint.orderservice.client.MainApiClient;
import bg.softuni.stylemint.orderservice.delivery.DeliveryService;
import bg.softuni.stylemint.orderservice.dto.OrderPaidRequest;
import bg.softuni.stylemint.orderservice.model.OrderItem;
import bg.softuni.stylemint.orderservice.service.OrderService;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stripe/webhook")
public class StripeWebhookController {

    private final OrderService orderService;
    private final MainApiClient mainApiClient;
    private final DeliveryService deliveryService;


    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @PostMapping
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {

        Event event;

        try {
            event = Webhook.constructEvent(payload, signature, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Invalid Stripe signature");
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        log.info("📩 Received Stripe event: {}", event.getType());

        switch (event.getType()) {
            case "checkout.session.completed" -> onCheckoutCompleted(event);
            case "payment_intent.succeeded" -> onPaymentIntentSucceeded(event);
            case "payment_intent.payment_failed" -> onPaymentFailed(event);
            case "checkout.session.expired" -> onCheckoutExpired(event);
        }

        return ResponseEntity.ok("received");
    }

    private void onCheckoutCompleted(Event event) {

        Session session = extractSession(event);
        if (session == null) return;

        String orderId = session.getMetadata().get("orderId");
        if (orderId == null) {
            log.warn("❗ No orderId metadata");
            return;
        }

        UUID id = UUID.fromString(orderId);

        // 1) Mark order as PAID
        orderService.markOrderAsPaid(id);
        log.info("💰 Order {} marked as PAID", id);

        // 2) Determine items
        boolean hasClothes  = orderService.containsClothes(id);
        boolean hasDigital  = orderService.containsDigitalAssets(id);

        log.info("🧩 Order {} → hasClothes={}, hasDigital={}", id, hasClothes, hasDigital);

        // 3) If there are clothes — get ONLY clothing items
        if (hasClothes) {
            List<OrderItem> clothesItems = orderService.getClothingItems(id);
            deliveryService.startDelivery(id, clothesItems);

            log.info("📦 Delivery started for {} with {} clothing items",
                    id, clothesItems.size());
        }

        // 4) Notify monolith for digital unlock (non-blocking)
        if (hasDigital) {
            try {
                mainApiClient.notifyOrderPaid(new OrderPaidRequest(id));
                log.info("🔓 Digital unlock requested for {}", id);
            } catch (Exception ex) {
                log.error("❗ Failed to notify monolith (but delivery continues)", ex);
            }
        }
    }


    // ============================================================
    // PAYMENT INTENT SUCCEEDED (Variant 2)
    // ============================================================
    private void onPaymentIntentSucceeded(Event event) {
        PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject()
                .orElse(null);

        if (intent == null) {
            log.warn("⚠️ PaymentIntent null in payment_intent.succeeded");
            return;
        }

        if (intent.getMetadata() == null || !intent.getMetadata().containsKey("orderId")) {
            log.warn("⚠️ No orderId metadata in payment_intent.succeeded");
            return;
        }

        UUID orderId = UUID.fromString(intent.getMetadata().get("orderId"));

        log.info("💳 payment_intent.succeeded for order {}", orderId);

        orderService.markOrderAsPaid(orderId);
        mainApiClient.notifyOrderPaid(new OrderPaidRequest(orderId));
    }

    // ============================================================
    // PAYMENT FAILED
    // ============================================================
    private void onPaymentFailed(Event event) {
        Session session = (Session) event.getDataObjectDeserializer()
                .getObject()
                .orElse(null);

        if (session == null || session.getMetadata() == null) return;

        UUID orderId = UUID.fromString(session.getMetadata().get("orderId"));
        log.info("❌ Payment failed for order {}", orderId);

        orderService.markOrderAsFailed(orderId);
    }

    // ============================================================
    // CHECKOUT EXPIRED
    // ============================================================
    private void onCheckoutExpired(Event event) {
        Session session = (Session) event.getDataObjectDeserializer()
                .getObject()
                .orElse(null);

        if (session == null || session.getMetadata() == null) return;

        UUID orderId = UUID.fromString(session.getMetadata().get("orderId"));
        log.info("⌛ Checkout expired for order {}", orderId);

        orderService.markOrderAsCancelled(orderId);
    }

    private Session extractSession(Event event) {
        Session session = event.getDataObjectDeserializer()
                .getObject()
                .filter(obj -> obj instanceof Session)
                .map(obj -> (Session) obj)
                .orElse(null);

        if (session != null) return session;

        try {
            String json = event.getData().getObject().toJson();
            JsonObject root = new Gson().fromJson(json, JsonObject.class);
            String id = root.get("id").getAsString();
            return Session.retrieve(id);
        } catch (Exception ex) {
            log.error("❌ Failed to parse Stripe Session", ex);
            return null;
        }
    }

}

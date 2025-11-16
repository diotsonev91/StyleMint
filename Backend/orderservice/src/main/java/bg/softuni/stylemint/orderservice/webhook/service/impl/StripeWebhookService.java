package bg.softuni.stylemint.orderservice.webhook.service.impl;

import bg.softuni.dtos.order.OrderPaidRequest;
import bg.softuni.stylemint.orderservice.client.MainApiClient;
import bg.softuni.stylemint.orderservice.order.model.OrderItem;
import bg.softuni.stylemint.orderservice.order.service.OrderService;
import bg.softuni.stylemint.orderservice.webhook.service.WebhookHandlerService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.stripe.model.Event;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookService implements WebhookHandlerService {

    private final OrderService orderService;
    private final MainApiClient mainApiClient;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    public void handleEvent(String payload, String signature) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, signature, webhookSecret);
        } catch (SignatureVerificationException e) {
            throw new RuntimeException("Invalid Stripe signature");
        }

        log.info("📩 Stripe event: {}", event.getType());

        switch (event.getType()) {
            case "checkout.session.completed" -> handleCheckoutCompleted(event);
            case "payment_intent.succeeded" -> handlePaymentIntentSucceeded(event);
            case "payment_intent.payment_failed" -> handlePaymentFailed(event);
            case "checkout.session.expired" -> handleCheckoutExpired(event);
        }
    }


    private void handleCheckoutCompleted(Event event) {

        Session session = extractSession(event);
        if (session == null) return;

        UUID orderId = UUID.fromString(session.getMetadata().get("orderId"));

        orderService.markOrderAsPaid(orderId);
        log.info("💰 Order {} marked as PAID", orderId);

        boolean hasClothes = orderService.containsClothes(orderId);
        boolean hasDigital = orderService.containsDigitalAssets(orderId);

        if (hasClothes) {
            List<OrderItem> clothes = orderService.getClothingItems(orderId);
           // deliveryService.deliverClothes(orderId, clothes); todo publish event
        }

        if (hasDigital) {
            mainApiClient.notifyOrderPaid(new OrderPaidRequest(orderId));
        }
    }

    private void handlePaymentIntentSucceeded(Event event) {
        PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject()
                .orElse(null);

        UUID orderId = UUID.fromString(intent.getMetadata().get("orderId"));
        orderService.markOrderAsPaid(orderId);
        mainApiClient.notifyOrderPaid(new OrderPaidRequest(orderId));
    }

    private void handlePaymentFailed(Event event) {
        Session session = extractSession(event);
        UUID orderId = UUID.fromString(session.getMetadata().get("orderId"));
        orderService.markOrderAsFailed(orderId);
    }

    private void handleCheckoutExpired(Event event) {
        Session session = extractSession(event);
        UUID orderId = UUID.fromString(session.getMetadata().get("orderId"));
        orderService.markOrderAsCancelled(orderId);
    }

    private Session extractSession(Event event) {
        return event.getDataObjectDeserializer()
                .getObject()
                .filter(Session.class::isInstance)
                .map(Session.class::cast)
                .orElse(null);
    }
}


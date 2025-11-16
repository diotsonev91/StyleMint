package bg.softuni.stylemint.orderservice.webhook.service.impl;

import bg.softuni.dtos.order.OrderPaidRequest;
import bg.softuni.stylemint.orderservice.client.MainApiClient;
import bg.softuni.stylemint.orderservice.order.model.OrderItem;
import bg.softuni.stylemint.orderservice.order.service.OrderService;
import bg.softuni.stylemint.orderservice.webhook.service.WebhookHandlerService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
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
        String orderId = extractOrderIdFromMetadata(event);
        if (orderId == null) {
            log.error("❌ No orderId in checkout.session.completed metadata");
            return;
        }

        UUID orderUuid = UUID.fromString(orderId);
        orderService.markOrderAsPaid(orderUuid);
        log.info("💰 Order {} marked as PAID", orderUuid);

        boolean hasClothes = orderService.containsClothes(orderUuid);
        boolean hasDigital = orderService.containsDigitalAssets(orderUuid);

        if (hasClothes) {
            List<OrderItem> clothes = orderService.getClothingItems(orderUuid);
            // TODO: Send to delivery service
        }

        if (hasDigital) {
            mainApiClient.notifyOrderPaid(new OrderPaidRequest(orderUuid));
        }
    }

    private void handlePaymentIntentSucceeded(Event event) {
        String orderId = extractOrderIdFromMetadata(event);
        if (orderId == null) {
            log.error("❌ No orderId in payment_intent.succeeded metadata");
            return;
        }

        UUID orderUuid = UUID.fromString(orderId);
        orderService.markOrderAsPaid(orderUuid);
        log.info("💰 Order {} marked as PAID", orderUuid);
        mainApiClient.notifyOrderPaid(new OrderPaidRequest(orderUuid));
    }

    private void handlePaymentFailed(Event event) {
        String orderId = extractOrderIdFromMetadata(event);
        if (orderId == null) {
            log.error("❌ No orderId in payment_intent.payment_failed metadata");
            return;
        }

        UUID orderUuid = UUID.fromString(orderId);
        orderService.markOrderAsFailed(orderUuid);
    }

    private void handleCheckoutExpired(Event event) {
        String orderId = extractOrderIdFromMetadata(event);
        if (orderId == null) {
            log.error("❌ No orderId in checkout.session.expired metadata");
            return;
        }

        UUID orderUuid = UUID.fromString(orderId);
        orderService.markOrderAsCancelled(orderUuid);
    }

    /**
     * Извлича orderId директно от raw JSON на event-а
     */
    private String extractOrderIdFromMetadata(Event event) {
        try {
            StripeObject stripeObject = event.getDataObjectDeserializer().getObject().orElse(null);

            if (stripeObject == null) {
                // Ако десериализацията не работи, парсваме raw JSON
                return extractFromRawJson(event);
            }

            // Опитваме се да извлечем metadata от StripeObject
            Map<String, String> metadata = (Map<String, String>) stripeObject.getRawJsonObject()
                    .getAsJsonObject()
                    .getAsJsonObject("metadata")
                    .entrySet()
                    .stream()
                    .collect(java.util.stream.Collectors.toMap(
                            Map.Entry::getKey,
                            e -> e.getValue().getAsString()
                    ));

            String orderId = metadata.get("orderId");
            log.info("✅ Extracted orderId: {}", orderId);
            return orderId;

        } catch (Exception e) {
            log.error("❌ Failed to extract from StripeObject, trying raw JSON", e);
            return extractFromRawJson(event);
        }
    }

    /**
     * Fallback метод - извлича orderId директно от raw JSON string
     */
    private String extractFromRawJson(Event event) {
        try {
            String jsonString = event.getData().toJson();

            // Намираме "metadata" секцията
            int metadataIndex = jsonString.indexOf("\"metadata\"");
            if (metadataIndex == -1) {
                log.error("❌ No metadata found in JSON");
                return null;
            }

            // Намираме "orderId"
            int orderIdIndex = jsonString.indexOf("\"orderId\"", metadataIndex);
            if (orderIdIndex == -1) {
                log.error("❌ No orderId in metadata");
                return null;
            }

            // Извличаме стойността
            int valueStart = jsonString.indexOf("\"", orderIdIndex + 10) + 1;
            int valueEnd = jsonString.indexOf("\"", valueStart);

            String orderId = jsonString.substring(valueStart, valueEnd);
            log.info("✅ Extracted orderId from raw JSON: {}", orderId);
            return orderId;

        } catch (Exception e) {
            log.error("❌ Failed to extract from raw JSON", e);
            return null;
        }
    }
}
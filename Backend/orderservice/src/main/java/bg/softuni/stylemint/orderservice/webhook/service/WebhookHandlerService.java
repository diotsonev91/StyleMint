package bg.softuni.stylemint.orderservice.webhook.service;

public interface WebhookHandlerService {

    /**
     * Обработва Stripe webhook event
     *
     * @param payload JSON payload от Stripe
     * @param signature Stripe signature за валидация
     * @throws RuntimeException при невалидна signature
     */
    void handleEvent(String payload, String signature);

}
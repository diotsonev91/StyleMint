package bg.softuni.stylemint.orderservice.payment.service;

import bg.softuni.stylemint.orderservice.payment.exceptions.StripeServiceException;

import java.util.UUID;

public interface StripeService {

    /**
     * Creates a Stripe checkout session for payment processing
     *
     * @param totalAmount the total amount to be paid
     * @param successUrl the redirect URL after successful payment
     * @param cancelUrl the redirect URL after cancelled payment
     * @return the URL of the created checkout session
     * @throws StripeServiceException if the checkout session creation fails
     */
    String createCheckoutSession(Double totalAmount, UUID orderId, String successUrl, String cancelUrl) throws StripeServiceException;
}
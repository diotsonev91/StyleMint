package bg.softuni.stylemint.orderservice.service.impl;

import bg.softuni.stylemint.orderservice.exception.StripeServiceException;
import bg.softuni.stylemint.orderservice.service.StripeService;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class StripeServiceImpl implements StripeService {

    public StripeServiceImpl(@Value("${stripe.secret-key}") String secretKey) {
        Stripe.apiKey = secretKey;
    }

    @Override
    public String createCheckoutSession(Double totalAmount, UUID orderId, String successUrl, String cancelUrl) {

        try {
            SessionCreateParams params =
                    SessionCreateParams.builder()
                            .setMode(SessionCreateParams.Mode.PAYMENT)
                            .setSuccessUrl(successUrl)
                            .setCancelUrl(cancelUrl)
                            .putMetadata("orderId", orderId.toString())
                            .addLineItem(
                                    SessionCreateParams.LineItem.builder()
                                            .setQuantity(1L)
                                            .setPriceData(
                                                    SessionCreateParams.LineItem.PriceData.builder()
                                                            .setCurrency("usd")
                                                            .setUnitAmount((long) (totalAmount * 100))
                                                            .setProductData(
                                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                            .setName("StyleMint Order Payment")
                                                                            .build()
                                                            )
                                                            .build()
                                            )
                                            .build()
                            )
                            .build();

            Session session = Session.create(params);
            return session.getUrl();

        } catch (Exception ex) {
            throw new StripeServiceException("Failed to create Stripe session", ex);
        }
    }
}

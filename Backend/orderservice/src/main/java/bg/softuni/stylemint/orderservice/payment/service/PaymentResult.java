package bg.softuni.stylemint.orderservice.payment.service;

public record PaymentResult(
        boolean isCashOnDelivery,
        boolean shouldDeliverClothes,
        String paymentUrl
) {}

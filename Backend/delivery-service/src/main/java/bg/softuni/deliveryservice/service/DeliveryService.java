package bg.softuni.deliveryservice.service;


import bg.softuni.deliveryservice.external.dto.CourierRegistrationResponse;
import bg.softuni.deliveryservice.kafka.DeliveryEventProducer;
import bg.softuni.deliveryservice.model.Delivery;
import bg.softuni.deliveryservice.model.DeliveryStatus;
import bg.softuni.deliveryservice.repository.DeliveryRepository;
import bg.softuni.events.delivery.DeliveryCompletedEvent;
import bg.softuni.events.delivery.DeliveryRegisteredEvent;
import bg.softuni.events.delivery.StartDeliveryEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final CourierApiService courierApiService;
    private final DeliveryEventProducer eventProducer;

    @Value("${delivery.testing-mode:true}")
    private boolean testingMode;

    /**
     * Handles incoming delivery request from Order Service.
     * Registers delivery with courier and publishes confirmation event.
     */
    @Transactional
    public void startDelivery(StartDeliveryEvent event) {
        log.info("🚚 Starting delivery for order {}", event.getOrderId());

        // 1. Create delivery record
        Delivery delivery = Delivery.builder()
                .orderId(event.getOrderId())
                .itemIds(event.getItemIds())
                .deliveryAddress(event.getDeliveryAddress())
                .customerName(event.getCustomerName())
                .customerPhone(event.getCustomerPhone())
                .status(DeliveryStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        deliveryRepository.save(delivery);

        // 2. Register with courier API
        if (testingMode) {
            // TESTING MODE: Immediately simulate delivery
            log.info("⚠️ TESTING MODE: Simulating courier registration");
            simulateCourierRegistration(delivery);
            
            // Simulate immediate delivery (in production this would be webhook)
            log.info("⚠️ TESTING MODE: Simulating immediate delivery");
            simulateDeliveryCompletion(delivery);
        } else {
            // PRODUCTION MODE: Real courier API call
            registerWithCourier(delivery);
        }
    }

    /**
     * Simulates courier registration for testing.
     */
    private void simulateCourierRegistration(Delivery delivery) {
        String trackingNumber = "TEST-" + UUID.randomUUID().toString().substring(0, 8);
        delivery.setTrackingNumber(trackingNumber);
        delivery.setCourierName("Test Courier");
        delivery.setStatus(DeliveryStatus.REGISTERED);
        delivery.setRegisteredAt(LocalDateTime.now());
        deliveryRepository.save(delivery);

        // Publish event to Order Service
        DeliveryRegisteredEvent event = new DeliveryRegisteredEvent(
                delivery.getOrderId(),
                delivery.getId(),
                trackingNumber,
                "Test Courier"
        );
        eventProducer.publishDeliveryRegistered(event);
    }

    /**
     * Simulates delivery completion for testing.
     * In production, this would be triggered by courier webhook.
     */
    private void simulateDeliveryCompletion(Delivery delivery) {
        // In real scenario, this happens days later via webhook
        delivery.setStatus(DeliveryStatus.DELIVERED);
        delivery.setCompletedAt(LocalDateTime.now());
        deliveryRepository.save(delivery);

        // Publish event to Order Service
        DeliveryCompletedEvent event = new DeliveryCompletedEvent(
                delivery.getOrderId(),
                delivery.getItemIds(),
                delivery.getId(),
                LocalDateTime.now().toString()
        );
        eventProducer.publishDeliveryCompleted(event);
        
        log.info("✅ Delivery completed for order {}", delivery.getOrderId());
    }

    /**
     * Registers delivery with real courier API (production).
     */
    private void registerWithCourier(Delivery delivery) {
        try {
            log.info("📞 Calling courier API for order {}", delivery.getOrderId());
            
            CourierRegistrationResponse response = courierApiService.registerDelivery(
                    delivery.getDeliveryAddress(),
                    delivery.getCustomerName(),
                    delivery.getCustomerPhone()
            );

            delivery.setTrackingNumber(response.getTrackingNumber());
            delivery.setCourierName(response.getCourierName());
            delivery.setStatus(DeliveryStatus.REGISTERED);
            delivery.setRegisteredAt(LocalDateTime.now());
            deliveryRepository.save(delivery);

            // Publish event to Order Service
            DeliveryRegisteredEvent event = new DeliveryRegisteredEvent(
                    delivery.getOrderId(),
                    delivery.getId(),
                    response.getTrackingNumber(),
                    response.getCourierName()
            );
            eventProducer.publishDeliveryRegistered(event);

            log.info("✅ Delivery registered with courier: {}", response.getTrackingNumber());

        } catch (Exception e) {
            log.error("❌ Failed to register delivery with courier", e);
            delivery.setStatus(DeliveryStatus.FAILED);
            deliveryRepository.save(delivery);
            throw e;
        }
    }

    /**
     * Handles courier webhook when delivery is completed.
     * This is called by CourierWebhookController.
     */
    @Transactional
    public void handleDeliveryCompletion(String trackingNumber) {
        log.info("📦 Handling delivery completion for tracking: {}", trackingNumber);

        Delivery delivery = deliveryRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException("Delivery not found: " + trackingNumber));

        delivery.setStatus(DeliveryStatus.DELIVERED);
        delivery.setCompletedAt(LocalDateTime.now());
        deliveryRepository.save(delivery);

        // Publish event to Order Service
        DeliveryCompletedEvent event = new DeliveryCompletedEvent(
                delivery.getOrderId(),
                delivery.getItemIds(),
                delivery.getId(),
                LocalDateTime.now().toString()
        );
        eventProducer.publishDeliveryCompleted(event);

        log.info("✅ Delivery completion event published for order {}", delivery.getOrderId());
    }
}


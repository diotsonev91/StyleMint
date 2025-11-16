package bg.softuni.deliveryservice.service;

import bg.softuni.deliveryservice.external.dto.CourierApiResponse;
import bg.softuni.deliveryservice.external.dto.CourierRegistrationResponse;
import bg.softuni.deliveryservice.external.dto.CourierRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Service for integrating with external courier APIs (Speedy, Econt, etc.)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CourierApiService {

    private final RestTemplate restTemplate;

    @Value("${courier.api.url}")
    private String courierApiUrl;

    @Value("${courier.api.key}")
    private String courierApiKey;

    /**
     * Registers delivery with courier API.
     * 
     * Example for Speedy API:
     * POST https://api.speedy.bg/v1/shipments
     */
    public CourierRegistrationResponse registerDelivery(
            String address,
            String customerName,
            String customerPhone) {
        
        log.info("📞 Calling courier API to register delivery");

        // Example request body for Speedy
        CourierRequest request = new CourierRequest();
        request.setRecipientName(customerName);
        request.setRecipientPhone(customerPhone);
        request.setAddress(address);
        request.setServiceId(505); // Speedy service ID
        
        try {
            // Make API call
            CourierApiResponse response = restTemplate.postForObject(
                    courierApiUrl + "/shipments",
                    request,
                    CourierApiResponse.class
            );

            if (response != null && response.isSuccess()) {
                log.info("✅ Courier registration successful: {}", response.getTrackingNumber());
                
                CourierRegistrationResponse result = new CourierRegistrationResponse();
                result.setTrackingNumber(response.getTrackingNumber());
                result.setCourierName("Speedy");
                return result;
            } else {
                throw new RuntimeException("Courier API returned error");
            }

        } catch (Exception e) {
            log.error("❌ Failed to call courier API", e);
            throw new RuntimeException("Courier registration failed", e);
        }
    }
}



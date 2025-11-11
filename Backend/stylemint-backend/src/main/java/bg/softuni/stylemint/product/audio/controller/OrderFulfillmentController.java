// File: OrderFulfillmentController.java
package bg.softuni.stylemint.product.audio.controller;

import bg.softuni.stylemint.product.audio.service.impl.SampleLicenseServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/audio/licenses")
@RequiredArgsConstructor
public class OrderFulfillmentController {

    private final SampleLicenseServiceImpl sampleLicenseService;

    @PostMapping("/fulfill-order")
    public ResponseEntity<Void> fulfillOrder(
            @RequestParam UUID orderId,
            @RequestParam UUID userId) {

        log.info("Received order fulfillment request for order: {}, user: {}", orderId, userId);
        sampleLicenseService.processOrderFulfillment(orderId, userId);
        return ResponseEntity.ok().build();
    }
}
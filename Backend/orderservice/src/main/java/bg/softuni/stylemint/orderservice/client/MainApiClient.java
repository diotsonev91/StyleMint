package bg.softuni.stylemint.orderservice.client;

import bg.softuni.dtos.order.OrderPaidRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "main-api",
        url = "http://localhost:8080"  // адреса на монолита
)
public interface MainApiClient {

    @PostMapping("/api/orders/payment-success")
    void notifyOrderPaid(@RequestBody OrderPaidRequest request);
}


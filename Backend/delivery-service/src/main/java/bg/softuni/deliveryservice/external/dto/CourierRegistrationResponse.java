package bg.softuni.deliveryservice.external.dto;

// ========================================
// CourierRegistrationResponse DTO
// ========================================
public class CourierRegistrationResponse {
    private String trackingNumber;
    private String courierName;

    // getters/setters
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public String getCourierName() { return courierName; }
    public void setCourierName(String courierName) { this.courierName = courierName; }
}


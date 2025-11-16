package bg.softuni.deliveryservice.external.dto;

// ========================================
// Courier API DTOs
// ========================================
public class CourierRequest {
    private String recipientName;
    private String recipientPhone;
    private String address;
    private int serviceId;

    // getters/setters
    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
    public String getRecipientPhone() { return recipientPhone; }
    public void setRecipientPhone(String recipientPhone) { this.recipientPhone = recipientPhone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public int getServiceId() { return serviceId; }
    public void setServiceId(int serviceId) { this.serviceId = serviceId; }
}

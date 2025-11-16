package bg.softuni.deliveryservice.model;

public enum DeliveryStatus {
    PENDING,        // Чака регистрация с courier
    REGISTERED,     // Регистрирана с courier
    IN_TRANSIT,     // В процес на доставка
    DELIVERED,      // Доставена
    FAILED          // Неуспешна
}

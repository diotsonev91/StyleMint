package bg.softuni.stylemint.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Обобщена информация за поръчките на потребителя.
 * Използва се в профила на user-а и админ панели.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserOrderSummaryDTO {

    /**
     * Общо направени поръчки.
     */
    private Long totalOrders;

    /**
     * Последни 10 поръчки (или по-малко, ако няма достатъчно).
     */
    private List<OrderPreviewDTO> recentOrders;

    /**
     * Общо похарчена сума от user-а.
     */
    private Double totalSpent;
}

package bg.softuni.stylemint.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 *Summarized information about the user's orders.
 *Used in the user's profile and admin panels.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserOrderSummaryDTO {


    private Long totalOrders;

    /**
     * Last 10 orders (or less if there are not enough).
     */
    private List<OrderPreviewDTO> recentOrders;


    private Double totalSpent;
}

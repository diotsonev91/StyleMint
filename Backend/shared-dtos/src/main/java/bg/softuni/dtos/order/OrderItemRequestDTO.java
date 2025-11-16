package bg.softuni.dtos.order;

import bg.softuni.dtos.enums.payment.ProductType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for each order Item inside the order
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequestDTO {
    private ProductType productType;
    private UUID productId;
    private Integer quantity;
    private Double pricePerUnit;
    private String customizationJson; // only for CLOTHES
}

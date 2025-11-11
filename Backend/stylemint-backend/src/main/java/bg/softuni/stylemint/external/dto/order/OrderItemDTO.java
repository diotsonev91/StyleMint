// File: OrderItemDTO.java (in orchestrator)
package bg.softuni.stylemint.external.dto.order;

import bg.softuni.stylemint.external.enums.ProductType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
    private UUID id;
    private ProductType productType;
    private UUID productId;
    private Integer quantity;
    private Double pricePerUnit;
    private String customizationJson;
    private OffsetDateTime createdAt;
}
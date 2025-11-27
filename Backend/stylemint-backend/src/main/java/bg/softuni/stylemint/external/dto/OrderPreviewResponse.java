package bg.softuni.stylemint.external.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderPreviewResponse {
    private Double totalAmount;
    private Integer itemCount;
}

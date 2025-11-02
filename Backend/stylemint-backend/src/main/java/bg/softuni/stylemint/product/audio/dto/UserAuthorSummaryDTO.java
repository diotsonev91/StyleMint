package bg.softuni.stylemint.product.audio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAuthorSummaryDTO {
    private Long totalSamples;
    private Long totalPacks;
    private Long totalSales;
    private Double revenue;
}

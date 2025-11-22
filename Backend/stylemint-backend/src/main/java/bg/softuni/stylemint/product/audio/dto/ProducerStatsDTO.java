package bg.softuni.stylemint.product.audio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProducerStatsDTO {
    private Long totalSamples;
    private Long totalPacks;
    private Double totalRevenue;
    private Double averageRating;
    private Integer totalDownloads;
    private Long totalSales;
}
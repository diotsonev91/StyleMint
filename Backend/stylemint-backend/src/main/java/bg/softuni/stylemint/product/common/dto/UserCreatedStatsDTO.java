package bg.softuni.stylemint.product.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Агрегира съдържанието, което user е създал (designs, samples, packs).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreatedStatsDTO {
    private Long totalDesigns;
    private Long totalSamples;
    private Long totalPacks;
    private Long totalItems;
}

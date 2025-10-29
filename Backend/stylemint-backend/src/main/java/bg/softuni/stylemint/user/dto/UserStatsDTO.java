package bg.softuni.stylemint.user.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDTO {
    private Long orderCount;
    private Long designCount;
    private Long sampleCount;
    private Long packCount;
    private Long gameScore;
    private Long totalContentCount;
}
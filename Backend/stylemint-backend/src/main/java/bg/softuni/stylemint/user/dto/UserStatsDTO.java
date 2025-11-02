package bg.softuni.stylemint.user.dto;

import bg.softuni.stylemint.game.dto.UserGameSummaryDTO;
import bg.softuni.stylemint.product.audio.dto.UserAuthorSummaryDTO;
import bg.softuni.stylemint.product.dto.UserCreatedStatsDTO;
import bg.softuni.stylemint.product.fashion.dto.UserDesignerSummaryDTO;
import bg.softuni.stylemint.order.dto.UserOrderSummaryDTO;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDTO {
    private UserGameSummaryDTO game;
    private UserDesignerSummaryDTO design;
    private UserAuthorSummaryDTO audio;
    private UserOrderSummaryDTO orders;
    private UserCreatedStatsDTO created;
}

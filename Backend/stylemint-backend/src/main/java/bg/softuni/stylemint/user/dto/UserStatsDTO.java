package bg.softuni.stylemint.user.dto;

import bg.softuni.dtos.order.UserOrderSummaryDTO;
import bg.softuni.stylemint.game.dto.UserGameSummaryDTO;
import bg.softuni.stylemint.product.audio.dto.UserAuthorSummaryDTO;
import bg.softuni.stylemint.product.common.dto.UserCreatedStatsDTO;
import bg.softuni.stylemint.product.fashion.dto.UserDesignerSummaryDTO;

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

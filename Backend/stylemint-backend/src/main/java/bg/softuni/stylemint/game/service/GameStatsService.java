package bg.softuni.stylemint.game.service;

import java.util.UUID;

public interface GameStatsService {
    long getUserScore(UUID userId);
}

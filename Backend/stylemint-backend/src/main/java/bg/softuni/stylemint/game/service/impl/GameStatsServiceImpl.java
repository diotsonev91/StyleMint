package bg.softuni.stylemint.game.service.impl;

import bg.softuni.stylemint.game.repository.GameStatsRepository;
import bg.softuni.stylemint.game.service.GameStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GameStatsServiceImpl implements GameStatsService {

    private final GameStatsRepository gameStatsRepository;

    @Override
    public long getUserScore(UUID userId) {
        return gameStatsRepository.findByUserId(userId)
                .map(stats -> (long) stats.getScore())
                .orElse(0L);
    }
}

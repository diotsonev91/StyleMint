package bg.softuni.stylemint.user.service.impl;

import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.game.service.GameStatsService;
import bg.softuni.stylemint.order.service.OrderService;
import bg.softuni.stylemint.product.audio.service.AudioSampleService;
import bg.softuni.stylemint.product.audio.service.SamplePackService;
import bg.softuni.stylemint.product.fashion.service.ClothDesignService;
import bg.softuni.stylemint.user.dto.UserStatsDTO;
import bg.softuni.stylemint.user.enums.UserRole;
import bg.softuni.stylemint.user.repository.UserRepository;
import bg.softuni.stylemint.user.service.UserStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserStatisticsServiceImpl implements UserStatisticsService {

    private final UserRepository userRepository;
    private final OrderService orderService;
    private final ClothDesignService clothDesignService;
    private final AudioSampleService audioSampleService;
    private final SamplePackService samplePackService;
    private final GameStatsService gameStatsService;

    @Override
    public UserStatsDTO getUserStats(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new NotFoundException("User not found with id: " + userId);
        }

        long orderCount = orderService.countOrdersByUser(userId);
        long designCount = clothDesignService.countDesignsByUser(userId);
        long sampleCount = audioSampleService.countSamplesByAuthor(userId);
        long packCount = samplePackService.countPacksByAuthor(userId);
        long gameScore = gameStatsService.getUserScore(userId);

        return UserStatsDTO.builder()
                .orderCount(orderCount)
                .designCount(designCount)
                .sampleCount(sampleCount)
                .packCount(packCount)
                .gameScore(gameScore)
                .totalContentCount(sampleCount + packCount)
                .build();
    }

    @Override
    public long countUsersByRole(UserRole userRole) {
        return userRepository.findByRole(userRole).size();
    }

    @Override
    public long countUsersRegisteredToday() {
        LocalDate today = LocalDate.now();
        OffsetDateTime start = today.atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
        OffsetDateTime end = start.plusDays(1);
        return userRepository.findByCreatedAtBetween(start, end).size();
    }

    @Override
    public long countUsersRegisteredThisWeek() {
        OffsetDateTime weekStart = OffsetDateTime.now()
                .truncatedTo(ChronoUnit.DAYS)
                .minusWeeks(1);
        return userRepository.findByCreatedAtAfter(weekStart).size();
    }

    @Override
    public long countUsersRegisteredThisMonth() {
        OffsetDateTime monthStart = OffsetDateTime.now()
                .withDayOfMonth(1)
                .truncatedTo(ChronoUnit.DAYS);
        return userRepository.findByCreatedAtAfter(monthStart).size();
    }


}

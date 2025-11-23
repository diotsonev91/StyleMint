package bg.softuni.stylemint.user.service.impl;

import bg.softuni.dtos.order.UserOrderSummaryDTO;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.external.exceptions.order.OrderServiceException;
import bg.softuni.stylemint.external.facade.order.OrderServiceFacade;
import bg.softuni.stylemint.game.dto.UserGameSummaryDTO;
import bg.softuni.stylemint.game.service.GameService;
import bg.softuni.stylemint.product.audio.dto.ProducerStatsDTO;
import bg.softuni.stylemint.product.audio.dto.UserAuthorSummaryDTO;
import bg.softuni.stylemint.product.audio.service.AudioSampleService;
import bg.softuni.stylemint.product.audio.service.SamplePackService;
import bg.softuni.stylemint.product.dto.UserCreatedStatsDTO;
import bg.softuni.stylemint.product.fashion.dto.UserDesignerSummaryDTO;
import bg.softuni.stylemint.product.fashion.service.ClothDesignService;
import bg.softuni.stylemint.user.dto.UserStatsDTO;
import bg.softuni.stylemint.user.enums.UserRole;
import bg.softuni.stylemint.user.repository.UserRepository;
import bg.softuni.stylemint.user.service.UserStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class UserStatisticsServiceImpl implements UserStatisticsService {

    private final UserRepository userRepository;
    private final OrderServiceFacade orderServiceFacade;
    private final ClothDesignService clothDesignService;
    private final AudioSampleService audioSampleService;
    private final SamplePackService samplePackService;
    private final GameService gameService;

    @Override
    public UserStatsDTO getUserStats(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new NotFoundException("User not found with id: " + userId);
        }

        // Get game statistics
        UserGameSummaryDTO gameSummary = gameService.getUserGameSummary(userId);

        // Get design statistics
        UserDesignerSummaryDTO designerSummary = clothDesignService.getUserDesignerSummary(userId);

        // Get audio statistics
        ProducerStatsDTO producerStats = samplePackService.getProducerStats(userId);
        UserAuthorSummaryDTO audioSummary = UserAuthorSummaryDTO.builder()
                .totalSamples(audioSampleService.countSamplesByAuthor(userId))
                .totalPacks(samplePackService.countPacksByAuthor(userId))
                .totalSales(producerStats.getTotalSales())
                .revenue(producerStats.getTotalRevenue())
                .build();

        // Get order statistics
        UserOrderSummaryDTO orderSummary = getOrderSummaryGracefully(userId);

        // Calculate created content statistics
        long totalDesigns = designerSummary.getTotalDesigns();
        long totalSamples = audioSummary.getTotalSamples();
        long totalPacks = audioSummary.getTotalPacks();

        UserCreatedStatsDTO createdStats = UserCreatedStatsDTO.builder()
                .totalDesigns(totalDesigns)
                .totalSamples(totalSamples)
                .totalPacks(totalPacks)
                .totalItems(totalDesigns + totalSamples + totalPacks)
                .build();

        return UserStatsDTO.builder()
                .game(gameSummary)
                .design(designerSummary)
                .audio(audioSummary)
                .orders(orderSummary)
                .created(createdStats)
                .build();
    }

    private UserOrderSummaryDTO getOrderSummaryGracefully(UUID userId) {
        try {
            return orderServiceFacade.getUserOrderSummary(userId);
        } catch (OrderServiceException ex) {
            // Log the error but don't fail the entire request
            log.warn("Order service unavailable for user {}: {}", userId, ex.getMessage());

            // Return empty order summary instead of failing
            return UserOrderSummaryDTO.builder()
                    .totalOrders(0L)
                    .totalSpent(0.0)
                    .recentOrders(Collections.emptyList())
                    .serviceAvailable(false)
                    .build();
        } catch (Exception ex) {
            log.error("Unexpected error fetching order summary for user {}", userId, ex);

            // Return empty order summary for any other error
            return UserOrderSummaryDTO.builder()
                    .totalOrders(0L)
                    .totalSpent(0.0)
                    .recentOrders(Collections.emptyList())
                    .serviceAvailable(false)
                    .build();
        }
    }

    @Override
    public long countUsersByRole(UserRole userRole) {
        return userRepository.countByRolesContaining(userRole);
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

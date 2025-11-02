package bg.softuni.stylemint.user.service;

import bg.softuni.stylemint.user.dto.UserStatsDTO;
import bg.softuni.stylemint.user.enums.UserRole;

import java.util.UUID;

public interface UserStatisticsService {

    UserStatsDTO getUserStats(UUID userId);

    long countUsersByRole(UserRole userRole);

    long countUsersRegisteredToday();

    long countUsersRegisteredThisWeek();

    long countUsersRegisteredThisMonth();
}

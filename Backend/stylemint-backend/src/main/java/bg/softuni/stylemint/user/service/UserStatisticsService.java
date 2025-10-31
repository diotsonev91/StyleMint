package bg.softuni.stylemint.user.service;

import bg.softuni.stylemint.user.dto.UserStatsDTO;
import bg.softuni.stylemint.user.model.Role;

import java.util.UUID;

public interface UserStatisticsService {

    UserStatsDTO getUserStats(UUID userId);

    long countUsersByRole(Role role);

    long countUsersRegisteredToday();

    long countUsersRegisteredThisWeek();

    long countUsersRegisteredThisMonth();
}

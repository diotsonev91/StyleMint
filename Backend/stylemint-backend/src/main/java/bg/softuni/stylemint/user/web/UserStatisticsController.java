package bg.softuni.stylemint.user.web;

import bg.softuni.stylemint.user.dto.UserStatsDTO;
import bg.softuni.stylemint.user.enums.UserRole;
import bg.softuni.stylemint.user.service.UserStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@RestController
@RequestMapping(BASE + "/users/stats")
@RequiredArgsConstructor
public class UserStatisticsController {

    private final UserStatisticsService userStatisticsService;

    /**
     * Get statistics for a specific user
     * Accessible by authenticated users
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserStatsDTO> getUserStats(@PathVariable UUID userId) {
        return ResponseEntity.ok(userStatisticsService.getUserStats(userId));
    }

    /**
     * Get count of users by role
     * Only accessible by admins
     */
    @GetMapping("/count/role/{userRole}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> countUsersByRole(@PathVariable UserRole userRole) {
        long count = userStatisticsService.countUsersByRole(userRole);
        Map<String, Object> response = new HashMap<>();
        response.put("role", userRole.name());
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Get count of users registered today
     * Only accessible by admins
     */
    @GetMapping("/count/today")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> countUsersRegisteredToday() {
        long count = userStatisticsService.countUsersRegisteredToday();
        Map<String, Object> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Get count of users registered this week
     * Only accessible by admins
     */
    @GetMapping("/count/week")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> countUsersRegisteredThisWeek() {
        long count = userStatisticsService.countUsersRegisteredThisWeek();
        Map<String, Object> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Get count of users registered this month
     * Only accessible by admins
     */
    @GetMapping("/count/month")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> countUsersRegisteredThisMonth() {
        long count = userStatisticsService.countUsersRegisteredThisMonth();
        Map<String, Object> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all registration statistics at once
     * Only accessible by admins
     */
    @GetMapping("/count/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllRegistrationStats() {
        Map<String, Object> byRole = new HashMap<>();
        byRole.put("customer", userStatisticsService.countUsersByRole(UserRole.CUSTOMER));
        byRole.put("admin", userStatisticsService.countUsersByRole(UserRole.ADMIN));

        Map<String, Object> response = new HashMap<>();
        response.put("today", userStatisticsService.countUsersRegisteredToday());
        response.put("thisWeek", userStatisticsService.countUsersRegisteredThisWeek());
        response.put("thisMonth", userStatisticsService.countUsersRegisteredThisMonth());
        response.put("byRole", byRole);

        return ResponseEntity.ok(response);
    }
}
package bg.softuni.stylemint.user.service;

import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.dto.UserProfileDTO;
import bg.softuni.stylemint.user.dto.UserStatsDTO;
import bg.softuni.stylemint.user.model.Role;
import bg.softuni.stylemint.user.model.User;

import java.util.List;
import java.util.UUID;

public interface UserService {

    // BASIC CRUD
    UserDTO findById(UUID id);
    UserDTO findByEmail(String email);
    UserDTO createUser(User user);
    UserDTO updateUser(UUID id, User user);
    void deleteUser(UUID id);

    // PROFILE
    UserProfileDTO getUserProfile(UUID userId);
    void updateDisplayName(UUID userId, String displayName);
    void updateAvatar(UUID userId, String avatarUrl);

    // STATS
    UserStatsDTO getUserStats(UUID userId);
    long countUsersByRole(Role role);
    long countUsersRegisteredToday();
    long countUsersRegisteredThisWeek();
    long countUsersRegisteredThisMonth();

    // SEARCH
    List<UserDTO> searchUsers(String query);
}

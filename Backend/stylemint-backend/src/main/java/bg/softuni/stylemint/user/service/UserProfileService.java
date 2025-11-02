package bg.softuni.stylemint.user.service;

import bg.softuni.stylemint.user.dto.UserProfileDTO;
import bg.softuni.stylemint.user.enums.UserRole;

import java.util.Set;
import java.util.UUID;

public interface UserProfileService {

    UserProfileDTO getUserProfile(UUID userId);

    void updateDisplayName(UUID userId, String displayName);

    void updateAvatar(UUID userId, String avatarUrl);

    public void updateUserRoles(UUID userId, Set<UserRole> newRoles);
}

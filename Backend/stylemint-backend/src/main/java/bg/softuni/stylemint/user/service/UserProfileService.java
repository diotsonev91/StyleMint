package bg.softuni.stylemint.user.service;

import bg.softuni.stylemint.user.dto.UserProfileDTO;

import java.util.UUID;

public interface UserProfileService {

    UserProfileDTO getUserProfile(UUID userId);

    void updateDisplayName(UUID userId, String displayName);

    void updateAvatar(UUID userId, String avatarUrl);
}

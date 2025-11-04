package bg.softuni.stylemint.user.service.impl;

import bg.softuni.stylemint.common.exception.ConflictException;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.user.dto.UserProfileDTO;
import bg.softuni.stylemint.user.dto.UserStatsDTO;
import bg.softuni.stylemint.user.enums.UserRole;
import bg.softuni.stylemint.user.model.User;
import bg.softuni.stylemint.user.repository.UserRepository;
import bg.softuni.stylemint.user.service.UserProfileService;
import bg.softuni.stylemint.user.service.UserStatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserProfileServiceImpl implements UserProfileService {

    private final UserRepository userRepository;
    private final UserStatisticsService userStatisticsService;

    @Override
    @Transactional(readOnly = true)
    public UserProfileDTO getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));

        UserStatsDTO stats = userStatisticsService.getUserStats(userId);

        return UserProfileDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .roles(user.getRoles())
                .memberSince(user.getCreatedAt())
                .stats(stats)
                .build();
    }

    @Override
    public void updateDisplayName(UUID userId, String displayName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));

        if (displayName == null || displayName.trim().isEmpty()) {
            throw new ConflictException("Display name cannot be empty");
        }

        if (!displayName.equals(user.getDisplayName()) &&
                userRepository.existsByDisplayName(displayName)) {
            throw new ConflictException("Display name already taken: " + displayName);
        }

        user.setDisplayName(displayName);
        userRepository.save(user);
    }

    @Override
    public void updateAvatar(UUID userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));

        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void updateUserRoles(UUID userId, Set<UserRole> newRoles) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setRoles(new HashSet<>(newRoles));
        userRepository.save(user);
    }

}

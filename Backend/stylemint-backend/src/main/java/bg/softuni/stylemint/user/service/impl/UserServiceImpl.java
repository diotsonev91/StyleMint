package bg.softuni.stylemint.user.service.impl;

import bg.softuni.stylemint.common.exception.ConflictException;
import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.user.dto.*;
import bg.softuni.stylemint.user.model.Role;
import bg.softuni.stylemint.user.model.User;
import bg.softuni.stylemint.user.repository.UserRepository;
import bg.softuni.stylemint.user.service.UserService;

// Import other repositories for calculations
import bg.softuni.stylemint.order.repository.OrderRepository;
import bg.softuni.stylemint.product.fashion.repository.ClothDesignRepository;
import bg.softuni.stylemint.product.audio.repository.AudioSampleRepository;
import bg.softuni.stylemint.product.audio.repository.SamplePackRepository;
import bg.softuni.stylemint.game.repository.GameStatsRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    // Other repositories for statistics
    //TODO
    //THOSE REPOSITORIES SHOULD NOT BE EXPOSED HERE !!!! USE SERVICES
    private final OrderRepository orderRepository;
    private final ClothDesignRepository clothDesignRepository;
    private final AudioSampleRepository audioSampleRepository;
    private final SamplePackRepository samplePackRepository;
    private final GameStatsRepository gameStatsRepository;

    // ============================================
    // BASIC CRUD
    // ============================================

    @Override
    @Transactional(readOnly = true)
    public UserDTO findById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        return mapToDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));
        return mapToDTO(user);
    }

    @Override
    public UserDTO createUser(User user) {
        // Validate email uniqueness
        if (userRepository.existsByEmailIgnoreCase(user.getEmail())) {
            throw new ConflictException("Email already exists: " + user.getEmail());
        }

        // Validate display name uniqueness (if provided)
        if (user.getDisplayName() != null &&
                userRepository.existsByDisplayName(user.getDisplayName())) {
            throw new ConflictException("Display name already taken: " + user.getDisplayName());
        }

        User saved = userRepository.save(user);
        return mapToDTO(saved);
    }

    @Override
    public UserDTO updateUser(UUID id, User user) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));

        // Validate display name uniqueness if being changed
        if (user.getDisplayName() != null &&
                !user.getDisplayName().equals(existing.getDisplayName())) {

            if (userRepository.existsByDisplayName(user.getDisplayName())) {
                throw new ConflictException("Display name already taken: " + user.getDisplayName());
            }
        }

        // Update fields
        existing.setDisplayName(user.getDisplayName());
        existing.setAvatarUrl(user.getAvatarUrl());

        User updated = userRepository.save(existing);
        return mapToDTO(updated);
    }

    @Override
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));

        // Check if user can be deleted (has no orders, designs, etc.)
        if (!canDeleteUser(id)) {
            throw new ForbiddenOperationException(
                    "User cannot be deleted because they have associated orders, designs, or uploaded content. " +
                            "Please contact support for account deletion assistance."
            );
        }

        userRepository.delete(user);
    }

    // ============================================
    // PROFILE
    // ============================================

    @Override
    @Transactional(readOnly = true)
    public UserProfileDTO getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));

        // Calculate statistics in service layer
        UserStatsDTO stats = getUserStats(userId);

        return UserProfileDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .memberSince(user.getCreatedAt())
                .stats(stats)
                .build();
    }

    @Override
    public void updateDisplayName(UUID userId, String displayName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));

        // Validate displayName is not empty
        if (displayName == null || displayName.trim().isEmpty()) {
            throw new ConflictException("Display name cannot be empty");
        }

        // Validate uniqueness
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

    // ============================================
    // STATISTICS (Calculated in Service Layer)
    // ============================================

    @Override
    @Transactional(readOnly = true)
    public UserStatsDTO getUserStats(UUID userId) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new NotFoundException("User not found with id: " + userId);
        }

        // Get counts from different repositories
        long orderCount = orderRepository.countByUserId(userId);
        long designCount = clothDesignRepository.countByUserId(userId);
        long sampleCount = audioSampleRepository.countByAuthorId(userId);
        long packCount = samplePackRepository.countByAuthorId(userId);

        // Check if user has game stats
        Long gameScore = gameStatsRepository.findByUserId(userId)
                .map(gs -> (long) gs.getScore())
                .orElse(0L);

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
    @Transactional(readOnly = true)
    public long countUsersByRole(Role role) {
        return userRepository.findByRole(role).size();
    }

    @Override
    @Transactional(readOnly = true)
    public long countUsersRegisteredToday() {
        LocalDate today = LocalDate.now();
        OffsetDateTime startOfDay = today.atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
        OffsetDateTime endOfDay = startOfDay.plusDays(1);

        return userRepository.findByCreatedAtBetween(startOfDay, endOfDay).size();
    }

    @Override
    @Transactional(readOnly = true)
    public long countUsersRegisteredThisWeek() {
        OffsetDateTime weekStart = OffsetDateTime.now()
                .truncatedTo(ChronoUnit.DAYS)
                .minusWeeks(1);

        return userRepository.findByCreatedAtAfter(weekStart).size();
    }

    @Override
    @Transactional(readOnly = true)
    public long countUsersRegisteredThisMonth() {
        OffsetDateTime monthStart = OffsetDateTime.now()
                .withDayOfMonth(1)
                .truncatedTo(ChronoUnit.DAYS);

        return userRepository.findByCreatedAtAfter(monthStart).size();
    }

    // ============================================
    // SEARCH
    // ============================================

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) {
            throw new ConflictException("Search query cannot be empty");
        }

        return userRepository.findByDisplayNameContainingIgnoreCase(query)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private boolean canDeleteUser(UUID userId) {
        // Check if user has any associated data
        boolean hasOrders = orderRepository.countByUserId(userId) > 0;
        boolean hasDesigns = clothDesignRepository.countByUserId(userId) > 0;
        boolean hasSamples = audioSampleRepository.countByAuthorId(userId) > 0;
        boolean hasPacks = samplePackRepository.countByAuthorId(userId) > 0;

        return !hasOrders && !hasDesigns && !hasSamples && !hasPacks;
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
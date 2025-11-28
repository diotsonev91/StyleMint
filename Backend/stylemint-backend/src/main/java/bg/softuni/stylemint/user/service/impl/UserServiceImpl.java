// File: UserServiceImpl.java (UPDATED)
package bg.softuni.stylemint.user.service.impl;

import bg.softuni.stylemint.common.exception.ConflictException;
import bg.softuni.stylemint.common.exception.ForbiddenOperationException;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.external.facade.order.OrderServiceFacade;
import bg.softuni.stylemint.product.audio.service.AudioSampleService;
import bg.softuni.stylemint.product.audio.service.SamplePackService;
import bg.softuni.stylemint.product.fashion.service.ClothDesignService;
import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.enums.UserRole;
import bg.softuni.stylemint.user.model.User;
import bg.softuni.stylemint.user.repository.UserRepository;
import bg.softuni.stylemint.user.service.UserService;
import bg.softuni.stylemint.user.service.util.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final ClothDesignService clothDesignService;
    private final AudioSampleService audioSampleService;
    private final SamplePackService samplePackService;

    @Override
    @Transactional(readOnly = true)
    public UserDTO findById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        return UserMapper.toDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));
        return UserMapper.toDTO(user);
    }

    @Override
    public UserDTO createUser(String email, String displayName, String rawPassword) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email already exists: " + email);
        }

        if (userRepository.existsByDisplayName(displayName)) {
            throw new ConflictException("Display name already taken: " + displayName);
        }

        OffsetDateTime now = OffsetDateTime.now();

        User user = User.builder()
                .email(email)
                .displayName(displayName)
                .password(passwordEncoder.encode(rawPassword))
                .systemUser(false)
                .roles(Set.of(UserRole.CUSTOMER))
                .createdAt(now)
                .updatedAt(now)
                .build();

        return UserMapper.toDTO(userRepository.save(user));
    }

    @Override
    public UserDTO updateUser(UUID id, User user) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));

        if (user.getDisplayName() != null &&
                !user.getDisplayName().equals(existing.getDisplayName())) {

            if (userRepository.existsByDisplayName(user.getDisplayName())) {
                throw new ConflictException("Display name already taken: " + user.getDisplayName());
            }
            existing.setDisplayName(user.getDisplayName());
        }

        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isBlank()) {
            existing.setAvatarUrl(user.getAvatarUrl());
        }

        existing.setUpdatedAt(OffsetDateTime.now());

        return UserMapper.toDTO(userRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteUser(UUID targetUserId, UUID currentUserId) {

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new NotFoundException("User not found: " + targetUserId));

        User current = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NotFoundException("Current user not found"));

        // 1) Check permissions *********************************************

        // Case A: User deletes themself
        boolean isSelfDelete = targetUserId.equals(currentUserId);

        // Case B: Admin deletes someone else
        boolean isAdmin = current.getRoles().contains(UserRole.ADMIN);

        if (!isSelfDelete && !isAdmin) {
            throw new ForbiddenOperationException("You cannot delete another user's account.");
        }

        // Prevent deleting system user
        if (target.isSystemUser()) {
            throw new ForbiddenOperationException("System user cannot be deleted.");
        }

        // Prevent deleting admin unless it's self-delete
        if (target.getRoles().contains(UserRole.ADMIN) && !isSelfDelete) {
            throw new ForbiddenOperationException("Admins cannot delete other admins.");
        }


        // 2) Soft delete content *********************************************
        clothDesignService.deleteDesignsByUser(targetUserId);
        audioSampleService.archiveAllByAuthor(targetUserId);
        samplePackService.archiveAllByAuthor(targetUserId);

        // 3) Soft delete user ***********************************************
        target.setDeleted(true);
        target.setDeletedAt(OffsetDateTime.now());
        userRepository.save(target);

        log.info("🔒 User {} deleted by {}", targetUserId, currentUserId);
    }


    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) {
            throw new ConflictException("Search query cannot be empty");
        }

        return userRepository.findByDisplayNameContainingIgnoreCase(query)
                .stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public User getUserById(UUID userId) {
        return userRepository.getUserById(userId);
    }


    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void adminDeleteUser(UUID targetUserId) {

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (target.isSystemUser()) {
            throw new ForbiddenOperationException("Root admin cannot be deleted.");
        }

        clothDesignService.deleteDesignsByUser(targetUserId);
        audioSampleService.archiveAllByAuthor(targetUserId);
        samplePackService.archiveAllByAuthor(targetUserId);

        target.setDeleted(true);
        target.setDeletedAt(OffsetDateTime.now());
        userRepository.save(target);

        log.info("❌ Admin deleted user {}", targetUserId);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void addRole(UUID userId, String roleName) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        UserRole role;
        try {
            role = UserRole.valueOf(roleName.toUpperCase());
        } catch (Exception e) {
            throw new ForbiddenOperationException("Invalid role: " + roleName);
        }

        if (user.getRoles().contains(role)) {
            return;
        }

        user.getRoles().add(role);
        userRepository.save(user);

        log.info("✅ Added role {} to user {}", role, userId);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void removeRole(UUID userId, String roleName) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        UserRole role;
        try {
            role = UserRole.valueOf(roleName.toUpperCase());
        } catch (Exception e) {
            throw new ForbiddenOperationException("Invalid role: " + roleName);
        }

        if (!user.getRoles().contains(role)) {
            return;
        }

        if (role == UserRole.ADMIN && user.isSystemUser()) {
            throw new ForbiddenOperationException("Cannot remove ADMIN from root user.");
        }

        user.getRoles().remove(role);
        userRepository.save(user);

        log.info("❌ Removed role {} from user {}", role, userId);
    }


}
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
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Domain dependencies for deletion checks - UPDATED to use Facade
    private final OrderServiceFacade orderServiceFacade;
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
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));

        if (!canDeleteUser(id)) {
            throw new ForbiddenOperationException(
                    "User cannot be deleted because they have associated data."
            );
        }

        userRepository.delete(user);
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

    private boolean canDeleteUser(UUID userId) {
        // Use OrderServiceFacade instead of OrderService
        Long orderCount = orderServiceFacade.countOrdersByUser(userId);

        return orderCount == 0
                && clothDesignService.countDesignsByUser(userId) == 0
                && audioSampleService.countSamplesByAuthor(userId) == 0
                && samplePackService.countPacksByAuthor(userId) == 0;
    }
}
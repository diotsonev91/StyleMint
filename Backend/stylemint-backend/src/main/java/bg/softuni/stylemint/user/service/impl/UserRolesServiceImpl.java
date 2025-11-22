package bg.softuni.stylemint.user.service.impl;

import bg.softuni.stylemint.user.enums.UserRole;
import bg.softuni.stylemint.user.model.User;
import bg.softuni.stylemint.user.repository.UserRepository;
import bg.softuni.stylemint.common.exception.NotFoundException;
import bg.softuni.stylemint.user.service.util.UserRolesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserRolesServiceImpl implements UserRolesService {

    private final UserRepository userRepository;

    /**
     * Updates the roles of a user.
     *
     * @param userId   The ID of the user whose roles are to be updated.
     * @param newRoles The new set of roles for the user.
     */
    @Override
    public void updateUserRoles(UUID userId, Set<UserRole> newRoles) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setRoles(new HashSet<>(newRoles));
        userRepository.save(user);
    }

    /**
     * Retrieves the roles of a user.
     *
     * @param userId The ID of the user whose roles are to be retrieved.
     * @return A set of roles assigned to the user.
     */
    @Override
    public Set<UserRole> getUserRoles(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return user.getRoles();
    }

    /**
     * Add a role to the user.
     * @param userId The ID of the user to which the role is to be added.
     * @param role   The role to add.
     */
    @Override
    @Transactional
    public void addRoleToUser(UUID userId, UserRole role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Check if the role is already present
        if (!user.getRoles().contains(role)) {
            user.getRoles().add(role);
            userRepository.save(user);
            log.info("Added role {} to user {}", role, userId);
        } else {
            log.info("User {} already has role {}", userId, role);
        }
    }

    /**
     * Remove a role from the user.
     *
     * @param userId The ID of the user from which the role is to be removed.
     * @param role   The role to remove.
     */
    @Override
    @Transactional
    public void removeRoleFromUser(UUID userId, UserRole role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Check if the user has the role
        if (user.getRoles().contains(role)) {
            // Role exists, remove it
            user.getRoles().remove(role);
            userRepository.save(user);

            // Log the successful removal
            log.info("Successfully removed role {} from user {}", role, userId);
        } else {
            // Log that no action was taken
            log.info("User {} does not have role {}. No removal performed.", userId, role);
        }
    }

}

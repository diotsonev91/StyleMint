package bg.softuni.stylemint.user.service.util;

import bg.softuni.stylemint.user.enums.UserRole;

import java.util.Set;
import java.util.UUID;

public interface UserRolesService {

    /**
     * Updates the roles of a user.
     *
     * @param userId   The ID of the user whose roles are to be updated.
     * @param newRoles The new set of roles for the user.
     */
    void updateUserRoles(UUID userId, Set<UserRole> newRoles);

    /**
     * Retrieves the roles of a user.
     *
     * @param userId The ID of the user whose roles are to be retrieved.
     * @return A set of roles assigned to the user.
     */
    Set<UserRole> getUserRoles(UUID userId);

    /**
     * Add a role to the user.
     *
     * @param userId The ID of the user to which the role is to be added.
     * @param role   The role to add.
     */
    void addRoleToUser(UUID userId, UserRole role);

    /**
     * Remove a role from the user.
     *
     * @param userId The ID of the user from which the role is to be removed.
     * @param role   The role to remove.
     */
    void removeRoleFromUser(UUID userId, UserRole role);
}
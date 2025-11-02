package bg.softuni.stylemint.user.security;

import bg.softuni.stylemint.auth.security.CustomUserDetails;
import bg.softuni.stylemint.user.enums.UserRole;
import bg.softuni.stylemint.user.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Security component for checking user permissions
 * Integrates with your JWT authentication system
 * Used in @PreAuthorize annotations
 */
@Slf4j
@Component("userSecurity")
public class UserSecurity {

    /**
     * Get the currently authenticated user from SecurityContext
     * Returns null if not authenticated
     */
    private User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                return null;
            }

            // Check if authentication is anonymous
            if ("anonymousUser".equals(authentication.getPrincipal())) {
                return null;
            }

            // Your JWT filter sets CustomUserDetails as principal
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            return userDetails.getUser();
        } catch (Exception e) {
            log.error("Error getting current user", e);
            return null;
        }
    }

    /**
     * Check if the current user can modify the target user
     * Allowed if:
     * - User is modifying their own profile
     * - User is an admin
     */
    public boolean canModifyUser(UUID targetUserId) {
        User currentUser = getCurrentUser();

        if (currentUser == null) {
            return false;
        }

        // User can modify their own profile
        if (currentUser.getId().equals(targetUserId)) {
            return true;
        }

        // Admins can modify any profile
        return currentUser.getUserRole() == UserRole.ADMIN;
    }

    /**
     * Check if the current user is an admin
     */
    public boolean isAdmin() {
        User currentUser = getCurrentUser();
        return currentUser != null && currentUser.getUserRole() == UserRole.ADMIN;
    }

    /**
     * Check if the current user is a customer
     */
    public boolean isCustomer() {
        User currentUser = getCurrentUser();
        return currentUser != null && currentUser.getUserRole() == UserRole.CUSTOMER;
    }

    /**
     * Get the current authenticated user ID
     * Returns null if not authenticated
     */
    public UUID getCurrentUserId() {
        User currentUser = getCurrentUser();
        return currentUser != null ? currentUser.getId() : null;
    }

    /**
     * Get the current authenticated user email
     * Returns null if not authenticated
     */
    public String getCurrentUserEmail() {
        User currentUser = getCurrentUser();
        return currentUser != null ? currentUser.getEmail() : null;
    }

    /**
     * Check if user is authenticated
     */
    public boolean isAuthenticated() {
        return getCurrentUser() != null;
    }

    /**
     * Check if current user owns the resource with given owner ID
     */
    public boolean isOwner(UUID ownerId) {
        User currentUser = getCurrentUser();
        return currentUser != null && currentUser.getId().equals(ownerId);
    }

    /**
     * Check if current user can access the resource
     * (either owner or admin)
     */
    public boolean canAccess(UUID resourceOwnerId) {
        User currentUser = getCurrentUser();

        if (currentUser == null) {
            return false;
        }

        // Admin can access everything
        if (currentUser.getUserRole() == UserRole.ADMIN) {
            return true;
        }

        // Owner can access their own resources
        return currentUser.getId().equals(resourceOwnerId);
    }
}
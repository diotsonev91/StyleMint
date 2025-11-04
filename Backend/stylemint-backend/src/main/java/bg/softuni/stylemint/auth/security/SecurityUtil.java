package bg.softuni.stylemint.auth.security;

import bg.softuni.stylemint.user.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class SecurityUtil {

    /**
     * Get the currently authenticated user
     * @return User entity
     * @throws IllegalStateException if no user is authenticated
     */
    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }

    /**
     * Get the ID of the currently authenticated user
     * @return UUID of the authenticated user
     */
    public static UUID getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * Get the email of the currently authenticated user
     * @return email of the authenticated user
     */
    public static String getCurrentUserEmail() {
        return getCurrentUser().getEmail();
    }

    /**
     * Check if a user ID matches the current authenticated user
     * @param userId the user ID to check
     * @return true if the IDs match
     */
    public static boolean isCurrentUser(UUID userId) {
        return getCurrentUserId().equals(userId);
    }
}
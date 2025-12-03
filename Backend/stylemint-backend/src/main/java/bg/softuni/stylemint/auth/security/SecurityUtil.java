package bg.softuni.stylemint.auth.security;

import bg.softuni.stylemint.user.enums.UserRole;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class SecurityUtil {

    /**
     * Get current authenticated user details
     */
    private static JwtUserDetails getCurrentUserDetails() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }

        return (JwtUserDetails) auth.getPrincipal();
    }

    /**
     * Get current user ID
     */
    public static UUID getCurrentUserId() {
        return getCurrentUserDetails().getUserId();
    }

    /**
     * Check if current user has specific role
     */
    public static boolean hasRole(UserRole role) {
        return getCurrentUserDetails().getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_" + role.name()));
    }

    /**
     * Check if user is authenticated
     */
    public static boolean isAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated();
    }

    /**
     * Check if current user is ADMIN
     */
    public static boolean isAdmin() {
        return hasRole(UserRole.ADMIN);
    }
}
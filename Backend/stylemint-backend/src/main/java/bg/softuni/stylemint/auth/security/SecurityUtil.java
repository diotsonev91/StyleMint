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
     * Get current user email
     */
    public static String getCurrentUserEmail() {
        return getCurrentUserDetails().getEmail();
    }

    /**
     * Check if current user has specific role
     */
    public static boolean hasRole(UserRole role) {
        return getCurrentUserDetails().getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_" + role.name()));
    }

    /**
     * Check if current user has any of the specified roles
     */
    public static boolean hasAnyRole(UserRole... roles) {
        for (UserRole role : roles) {
            if (hasRole(role)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get current user roles as Set<UserRole>
     */
    public static Set<UserRole> getCurrentUserRoles() {
        return getCurrentUserDetails().getAuthorities().stream()
                .map(auth -> auth.getAuthority().substring(5)) // Remove "ROLE_"
                .map(UserRole::valueOf)
                .collect(Collectors.toSet());
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
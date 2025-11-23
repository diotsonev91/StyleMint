package bg.softuni.stylemint.auth.security;

import bg.softuni.stylemint.user.enums.UserRole;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class SecurityUtil {

    /**
     * Get current authenticated user ID
     */
    public static UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }

        return UUID.fromString(authentication.getName());
    }

    /**
     * Check if current user has specific role
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_" + role));
    }

    /**
     * Check if current user has specific UserRole enum
     */
    public static boolean hasRole(UserRole role) {
        return hasRole(role.name());
    }

    /**
     * Check if current user has any of the specified roles
     */
    public static boolean hasAnyRole(String... roles) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        for (String role : roles) {
            if (hasRole(role)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if current user has any of the specified UserRole enums
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
     * Get all roles of current user
     */
    public static Collection<? extends GrantedAuthority> getCurrentUserRoles() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return java.util.Collections.emptyList();
        }

        return authentication.getAuthorities();
    }

    /**
     * Get current user roles as Set<UserRole>
     */
    public static Set<UserRole> getCurrentUserRolesAsEnum() {
        return getCurrentUserRoles().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> auth.startsWith("ROLE_"))
                .map(auth -> auth.substring(5))  // Remove "ROLE_" prefix
                .map(UserRole::valueOf)
                .collect(Collectors.toSet());
    }

    /**
     * Check if user is authenticated
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }

    /**
     * Check if current user is ADMIN
     */
    public static boolean isAdmin() {
        return hasRole(UserRole.ADMIN);
    }

    /**
     * Check if current user is USER
     */
    public static boolean isUser() {
        return hasRole(UserRole.CUSTOMER);
    }
}
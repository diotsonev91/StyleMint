package bg.softuni.stylemint.user.repository;


import bg.softuni.stylemint.user.model.User;
import bg.softuni.stylemint.user.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // ============================================
    // AUTHENTICATION (Essential for Spring Security)
    // ============================================

    /**
     * Find user by email (for login)
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if email exists (for registration)
     */
    boolean existsByEmail(String email);

    /**
     * Check if email exists (case insensitive)
     */
    boolean existsByEmailIgnoreCase(String email);

    // ============================================
    // PROFILE
    // ============================================

    /**
     * Find user by display name
     */
    Optional<User> findByDisplayName(String displayName);

    /**
     * Check if display name is taken
     */
    boolean existsByDisplayName(String displayName);

    // ============================================
    // ROLE QUERIES
    // ============================================

    /**
     * Find users by role
     */
    List<User> findByRolesContaining(UserRole role, Pageable pageable);


    long countByRolesContaining(UserRole role);

    /**
     * Search users by display name (partial, case insensitive)
     */
    List<User> findByDisplayNameContainingIgnoreCase(String displayName);

    /**
     * Search users by email or display name
     */
    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.displayName) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<User> searchUsers(@Param("query") String query, Pageable pageable);

    // ============================================
    // DATE QUERIES (for basic filtering)
    // ============================================

    /**
     * Find users created after date
     */
    List<User> findByCreatedAtAfter(OffsetDateTime date);

    /**
     * Find users created between dates
     */
    List<User> findByCreatedAtBetween(OffsetDateTime startDate, OffsetDateTime endDate);
}
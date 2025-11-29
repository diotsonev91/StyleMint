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
    Optional<User> findByEmailAndDeletedFalse(String email);

    /**
     * Check if email exists (for registration)
     */
    boolean existsByEmail(String email);

    /**
     * Check if email exists (case insensitive)
     */
    boolean existsByEmailIgnoreCaseAndDeletedFalse(String email);

    // ============================================
    // PROFILE
    // ============================================


    /**
     * Check if display name is taken
     */
    boolean existsByDisplayNameAndDeletedFalse(String displayName);

    // ============================================
    // ROLE QUERIES
    // ============================================




    long countByRolesContaining(UserRole role);

    /**
     * Search users by display name (partial, case insensitive)
     */
    List<User> findByDisplayNameContainingIgnoreCase(String displayName);

    /**
     * Search users by email or display name
     */
    @Query("""
        SELECT u FROM User u
        WHERE u.deleted = false
          AND (
                LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', :query, '%'))
              )
        """)
    Page<User> searchUsers(@Param("query") String query, Pageable pageable);


    // ============================================
    // DATE QUERIES (for basic filtering)
    // ============================================

    /**
     * Find users created after date
     */
    List<User> findByCreatedAtAfterAndDeletedFalse(OffsetDateTime date);

    /**
     * Find users created between dates
     */
    List<User> findByCreatedAtBetweenAndDeletedFalse(OffsetDateTime startDate, OffsetDateTime endDate);

    User getUserByIdAndDeletedFalse(UUID id);

    boolean existsByRolesContainingAndDeletedFalse(UserRole userRole);

    Page<User> findAllByDeletedFalse(Pageable pageable);
}
package bg.softuni.stylemint.user.web;

import bg.softuni.stylemint.auth.security.JwtUserDetails;
import bg.softuni.stylemint.auth.service.AuthService;
import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.model.User;
import bg.softuni.stylemint.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@Slf4j
@RestController
@RequestMapping(BASE + "/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    /**
     * Get user by ID
     * Accessible by authenticated users
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    /**
     * Get user by email
     * Accessible by authenticated users
     */
    @GetMapping("/email/{email}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.findByEmail(email));
    }

    /**
     * Search users by display name
     * Query parameter: q (search query)
     */
    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam String q) {
        return ResponseEntity.ok(userService.searchUsers(q));
    }

    /**
     * Update user information
     * Only accessible by the user themselves or admins
     */
    @PutMapping("/{id}")
    @PreAuthorize("@userSecurity.canModifyUser(#id)")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody User user) {

        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    /**
     * Delete user
     * Only accessible by the user themselves
     */
    @DeleteMapping("/{userId}")
    @PreAuthorize("@userSecurity.canDeleteUser(#userId, authentication.principal)")
    public ResponseEntity<Void> deleteUser(
            @PathVariable UUID userId,
            @AuthenticationPrincipal JwtUserDetails userDetails,
            HttpServletRequest request,
            HttpServletResponse response) {

        UUID currentUserId = userDetails.getUserId();
        boolean isSelfDeletion = userId.equals(currentUserId);

        userService.deleteUser(userId, currentUserId);

        // ⭐ LOGOUT само ако потребителят изтрива собствения си акаунт
        if (isSelfDeletion) {
            authService.logoutUser(userId, response);
            log.info("✅ User {} deleted account - tokens cleared from client", userId);
        }

        return ResponseEntity.noContent().build();
    }
}
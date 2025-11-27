package bg.softuni.stylemint.user.web;

import bg.softuni.stylemint.auth.security.SecurityUtil;
import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.model.User;
import bg.softuni.stylemint.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@RestController
@RequestMapping(BASE + "/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Get user by ID
     * Accessible by authenticated users
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    /**
     * Get user by email
     * Accessible by authenticated users
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.findByEmail(email));
    }

    /**
     * Search users by display name
     * Query parameter: q (search query)
     */
    @GetMapping("/search")
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
     * Only accessible by admins
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable UUID userId
    ) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();
        userService.deleteUser(userId, currentUserId);
        return ResponseEntity.noContent().build();
    }
}
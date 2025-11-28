package bg.softuni.stylemint.user.web;

import bg.softuni.stylemint.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@RestController
@RequestMapping( BASE + "/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    /**
     * Delete ANY user (except root admin).
     */
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUserAsAdmin(@PathVariable UUID userId) {

        userService.adminDeleteUser(userId);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{userId}/roles/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> addRoleToUser(
            @PathVariable UUID userId,
            @PathVariable String role
    ) {
        userService.addRole(userId, role);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}/roles/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeRoleFromUser(
            @PathVariable UUID userId,
            @PathVariable String role
    ) {
        userService.removeRole(userId, role);
        return ResponseEntity.noContent().build();
    }

}


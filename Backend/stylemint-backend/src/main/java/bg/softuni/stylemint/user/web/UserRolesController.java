package bg.softuni.stylemint.user.web;

import bg.softuni.stylemint.user.dto.UpdateRolesRequestDTO;
import bg.softuni.stylemint.user.service.util.UserRolesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@RestController
@RequestMapping(BASE + "/users/roles")
@RequiredArgsConstructor
public class UserRolesController {

    UserRolesService userRolesService;

    @PatchMapping("/{userId}")
    @PreAuthorize("@userSecurity.isAdmin()")
    public ResponseEntity<Void> updateUserRoles(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateRolesRequestDTO request) {
        userRolesService.updateUserRoles(userId, request.getRoles());
        return ResponseEntity.noContent().build();
    }

}

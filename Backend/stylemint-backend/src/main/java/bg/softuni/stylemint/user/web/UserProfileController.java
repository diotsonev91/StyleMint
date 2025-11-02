package bg.softuni.stylemint.user.web;

import bg.softuni.stylemint.user.dto.UpdateAvatarRequestDTO;
import bg.softuni.stylemint.user.dto.UpdateDisplayNameRequestDTO;
import bg.softuni.stylemint.user.dto.UpdateRolesRequestDTO;
import bg.softuni.stylemint.user.dto.UserProfileDTO;
import bg.softuni.stylemint.user.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@RestController
@RequestMapping(BASE + "/users/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    /**
     * Get user profile with statistics
     * Accessible by authenticated users
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable UUID userId) {
        return ResponseEntity.ok(userProfileService.getUserProfile(userId));
    }

    /**
     * Update display name
     * Only accessible by the user themselves or admins
     */
    @PatchMapping("/{userId}/display-name")
    @PreAuthorize("@userSecurity.canModifyUser(#userId)")
    public ResponseEntity<Void> updateDisplayName(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateDisplayNameRequestDTO request) {
        userProfileService.updateDisplayName(userId, request.getDisplayName());
        return ResponseEntity.noContent().build();
    }

    /**
     * Update avatar URL
     * Only accessible by the user themselves or admins
     */
    @PatchMapping("/{userId}/avatar")
    @PreAuthorize("@userSecurity.canModifyUser(#userId)")
    public ResponseEntity<Void> updateAvatar(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateAvatarRequestDTO request) {
        userProfileService.updateAvatar(userId, request.getAvatarUrl());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{userId}/roles")
    @PreAuthorize("@userSecurity.isAdmin()")
    public ResponseEntity<Void> updateUserRoles(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateRolesRequestDTO request) {
        userProfileService.updateUserRoles(userId, request.getRoles());
        return ResponseEntity.noContent().build();
    }



}
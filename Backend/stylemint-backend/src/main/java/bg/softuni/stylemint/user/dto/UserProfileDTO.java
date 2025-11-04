package bg.softuni.stylemint.user.dto;

import bg.softuni.stylemint.user.enums.UserRole;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private UUID id;
    private String email;
    private String displayName;
    private String avatarUrl;
    private Set<UserRole> roles;
    private OffsetDateTime memberSince;
    private UserStatsDTO stats;
}
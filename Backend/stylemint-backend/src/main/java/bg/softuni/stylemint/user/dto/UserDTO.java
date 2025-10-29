package bg.softuni.stylemint.user.dto;

import bg.softuni.stylemint.user.model.Role;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private UUID id;
    private String email;
    private String displayName;
    private String avatarUrl;
    private Role role;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
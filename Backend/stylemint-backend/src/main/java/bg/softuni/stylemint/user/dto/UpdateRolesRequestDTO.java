package bg.softuni.stylemint.user.dto;

import bg.softuni.stylemint.user.enums.UserRole;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRolesRequestDTO {
    @NotEmpty(message = "Roles list cannot be empty")
    private Set<UserRole> roles;
}

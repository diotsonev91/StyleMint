package bg.softuni.stylemint.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating display name
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDisplayNameRequestDTO {

    @NotBlank(message = "Display name cannot be empty")
    @Size(min = 2, message = "Display name must be at least 2 characters long")
    private String displayName;
}

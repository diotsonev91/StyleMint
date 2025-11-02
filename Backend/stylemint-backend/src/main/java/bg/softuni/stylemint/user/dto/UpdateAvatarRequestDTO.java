package bg.softuni.stylemint.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating avatar URL
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAvatarRequestDTO {

    @NotBlank(message = "Avatar URL cannot be empty")
    private String avatarUrl;
}
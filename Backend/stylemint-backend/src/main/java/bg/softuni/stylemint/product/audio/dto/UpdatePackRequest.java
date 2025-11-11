package bg.softuni.stylemint.product.audio.dto;

import bg.softuni.stylemint.product.audio.enums.Genre;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePackRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    @NotBlank(message = "Artist is required")
    @Size(max = 100, message = "Artist must not exceed 100 characters")
    private String artist;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Price must have at most 2 decimal places")
    private BigDecimal price;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotEmpty(message = "At least one genre is required")
    @Size(max = 5, message = "Maximum 5 genres allowed")
    private List<@NotNull Genre> genres = new ArrayList<>();

    @Size(max = 10, message = "Maximum 10 tags allowed")
    private List<@NotBlank @Size(max = 30, message = "Tag must not exceed 30 characters") String> tags = new ArrayList<>();

    private MultipartFile coverImage; // Not required for update

    // Explicit removal flag - frontend should set this to true when user removes the image
    private Boolean removeCoverImage = false;

    // Sample management fields
    @Valid
    private List<PackSampleInfo> samplesToAdd = new ArrayList<>();           // Add new samples

    private List<UUID> samplesToRemove = new ArrayList<>();                  // Remove existing samples

    private List<UUID> existingSamplesToAdd = new ArrayList<>();             // Add existing samples by ID

    // Custom validation: Either samplesToAdd or existingSamplesToAdd must have at least one item when adding samples
    public boolean hasAnySamplesToAdd() {
        return (samplesToAdd != null && !samplesToAdd.isEmpty()) ||
                (existingSamplesToAdd != null && !existingSamplesToAdd.isEmpty());
    }

    // Helper method to check if cover image should be removed
    public boolean shouldRemoveCoverImage() {
        return Boolean.TRUE.equals(removeCoverImage);
    }

    // Helper method to check if new cover image was uploaded
    public boolean hasNewCoverImage() {
        return coverImage != null && !coverImage.isEmpty();
    }
}
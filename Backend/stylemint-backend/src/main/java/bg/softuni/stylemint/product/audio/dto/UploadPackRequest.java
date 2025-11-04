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

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UploadPackRequest {

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

    @NotNull(message = "Cover image is required")
    private MultipartFile coverImage;

    @NotEmpty(message = "At least one sample is required")
    @Size(min = 1, max = 50, message = "Pack must contain between 1 and 50 samples")
    @Valid
    private List<PackSampleInfo> samples = new ArrayList<>();
}
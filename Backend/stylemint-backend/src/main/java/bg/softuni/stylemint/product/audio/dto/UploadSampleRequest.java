package bg.softuni.stylemint.product.audio.dto;

import bg.softuni.stylemint.product.audio.enums.*;
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
public class UploadSampleRequest {

    @NotNull(message = "File is required")
    private MultipartFile file;

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Artist name is required")
    @Size(max = 64, message = "Artist name must not exceed 64 characters")
    private String artist;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Price must have at most 2 decimal places")
    private BigDecimal price;

    @NotNull(message = "BPM is required")
    @Min(value = 1, message = "BPM must be at least 1")
    @Max(value = 300, message = "BPM must not exceed 300")
    private Integer bpm;

    @NotNull(message = "Musical key is required")
    private MusicalKey musicalKey;

    @NotNull(message = "Musical scale is required")
    private MusicalScale musicalScale;

    @NotNull(message = "Genre is required")
    private Genre genre;

    @NotNull(message = "Sample type is required")
    private SampleType sampleType;

    @NotNull(message = "Instrument group is required")
    private InstrumentGroup instrumentGroup;

    @Size(max = 10, message = "Maximum 10 tags allowed")
    private List<@NotBlank @Size(max = 30, message = "Tag must not exceed 30 characters") String> tags = new ArrayList<>();
}
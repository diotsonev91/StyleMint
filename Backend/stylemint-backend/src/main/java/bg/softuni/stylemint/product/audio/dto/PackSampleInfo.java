package bg.softuni.stylemint.product.audio.dto;

import bg.softuni.stylemint.product.audio.enums.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackSampleInfo {

    @NotNull(message = "Sample file is required")
    private MultipartFile file;

    @NotBlank(message = "Sample name is required")
    @Size(max = 100, message = "Sample name must not exceed 100 characters")
    private String name;

    @NotNull(message = "BPM is required")
    @Min(value = 1, message = "BPM must be at least 1")
    @Max(value = 300, message = "BPM must not exceed 300")
    private Integer bpm;

    @NotNull(message = "Musical key is required")
    private MusicalKey musicalKey;

    @NotNull(message = "Musical scale is required")
    private MusicalScale musicalScale;

    @NotNull(message = "Sample type is required")
    private SampleType sampleType;

    @NotNull(message = "Instrument group is required")
    private InstrumentGroup instrumentGroup;
}
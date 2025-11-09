package bg.softuni.stylemint.product.audio.dto;

import bg.softuni.stylemint.product.audio.enums.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackSampleInfo {

    @NotNull(message = "Sample file is required")
    private MultipartFile file;

    @NotBlank(message = "Sample name is required")
    @Size(max = 100, message = "Sample name must not exceed 100 characters")
    private String name;

    private Integer bpm;

    private MusicalKey musicalKey;

    private MusicalScale musicalScale;

    private SampleType sampleType;

    @NotNull(message = "Instrument group is required")
    private InstrumentGroup instrumentGroup;

    private BigDecimal individualPrice;
}
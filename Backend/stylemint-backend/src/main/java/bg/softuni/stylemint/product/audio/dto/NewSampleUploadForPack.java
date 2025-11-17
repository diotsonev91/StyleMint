package bg.softuni.stylemint.product.audio.dto;

import bg.softuni.stylemint.product.audio.enums.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewSampleUploadForPack {

    @NotNull(message = "Audio file is required")
    private MultipartFile file;

    @NotBlank(message = "Name is required")
    private String name;


    private Integer duration;
    private Integer bpm;
    private MusicalKey key;
    private MusicalScale scale;
    private Genre genre;

    @NotNull(message = "Sample type is required")
    private SampleType sampleType;

    @NotNull(message = "Instrument group is required")
    private InstrumentGroup instrumentGroup;


    @Size(max = 10, message = "Maximum 10 tags allowed")
    private List<@NotBlank @Size(max = 30, message = "Tag must not exceed 30 characters") String> tags = new ArrayList<>();
}

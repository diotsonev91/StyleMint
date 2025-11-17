package bg.softuni.stylemint.product.audio.dto;

import bg.softuni.stylemint.product.audio.enums.Genre;
import jakarta.validation.Valid;
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
public class UploadPackRequest {

    private String title;
    private String artist;
    private BigDecimal price;
    private String description;

    private List<Genre> genres = new ArrayList<>();
    private List<String> tags = new ArrayList<>();

    private MultipartFile coverImage;

    private List<UUID> existingSamplesToAdd = new ArrayList<>();

    @Valid
    private List<NewSampleUploadForPack> samples = new ArrayList<>();
}

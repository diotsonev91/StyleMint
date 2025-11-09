package bg.softuni.stylemint.product.audio.dto;

import bg.softuni.stylemint.product.audio.enums.Genre;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class UpdatePackRequest {
    private String title;
    private String artist;
    private BigDecimal price;
    private String description;
    private List<Genre> genres;
    private List<String> tags;
    private MultipartFile coverImage;

    // New fields for sample management
    private List<PackSampleInfo> samplesToAdd;           // Add new samples
    private List<UUID> samplesToRemove;                  // Remove existing samples
    private List<UUID> existingSamplesToAdd;             // Add existing samples by ID
    private Map<UUID, BigDecimal> samplePricing;         // Update individual sample prices
}
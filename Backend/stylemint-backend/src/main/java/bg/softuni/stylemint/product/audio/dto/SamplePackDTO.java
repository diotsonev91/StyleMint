package bg.softuni.stylemint.product.audio.dto;

import bg.softuni.stylemint.product.audio.enums.Genre;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SamplePackDTO {
    private UUID id;
    private String title;
    private UUID authorId;
    private String artist;
    private String coverImage;
    private Double price;
    private Integer sampleCount;
    private String totalSize;
    private String description;
    private List<Genre> genres;
    private List<String> tags;
    private Double rating;
    private Integer downloads;
    private OffsetDateTime releaseDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
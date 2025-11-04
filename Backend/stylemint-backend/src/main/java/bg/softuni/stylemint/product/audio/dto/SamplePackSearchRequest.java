package bg.softuni.stylemint.product.audio.dto;

import bg.softuni.stylemint.product.audio.enums.Genre;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SamplePackSearchRequest {
    private String artist;
    private Genre genre;
    private Double minPrice;
    private Double maxPrice;
    private Double minRating;
    private String searchTerm;
}
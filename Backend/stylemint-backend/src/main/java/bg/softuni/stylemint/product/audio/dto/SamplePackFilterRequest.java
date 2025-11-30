package bg.softuni.stylemint.product.audio.dto;

import bg.softuni.stylemint.product.audio.enums.Genre;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SamplePackFilterRequest {

    private String artist;
    private String title;
    private List<Genre> genres;
    private Double minPrice;
    private Double maxPrice;
    private Double minRating;
    private String sortBy; // "newest", "oldest", "rating", "price-low", "price-high", "downloads"
}
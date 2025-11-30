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
public class PackFilterMetadata {

    private List<String> availableArtists;
    private List<Genre> availableGenres;
    private Double minPrice;
    private Double maxPrice;
    private Long totalPacks;
}
package bg.softuni.stylemint.product.audio.dto;

import bg.softuni.stylemint.product.audio.enums.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AudioSampleSearchRequest {
    private Genre genre;
    private SampleType sampleType;
    private Integer minBpm;
    private Integer maxBpm;
    private MusicalKey key;
    private InstrumentGroup instrumentGroup;
    private Double minPrice;
    private Double maxPrice;
    private String searchTerm;
}
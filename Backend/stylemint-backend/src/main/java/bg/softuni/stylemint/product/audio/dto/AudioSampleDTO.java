package bg.softuni.stylemint.product.audio.dto;

import bg.softuni.stylemint.product.audio.enums.*;
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
public class AudioSampleDTO {
    private UUID id;
    private String name;
    private UUID authorId;
    private String artist;
    private String audioUrl;
    private Integer duration;
    private Integer bpm;
    private MusicalKey key;
    private MusicalScale scale;
    private Genre genre;
    private InstrumentGroup instrumentGroup;
    private SampleType sampleType;
    private Double price;
    private UUID packId;
    private String packTitle;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<String> tags;
}
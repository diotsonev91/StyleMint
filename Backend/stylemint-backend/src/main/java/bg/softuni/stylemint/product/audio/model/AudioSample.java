package bg.softuni.stylemint.product.audio.model;

import bg.softuni.stylemint.product.audio.enums.*;
import bg.softuni.stylemint.product.common.model.BaseProduct;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "audio_samples")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@SuperBuilder
public class AudioSample extends BaseProduct {

    @Column(nullable = false, length = 128)
    private String name;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(name = "artist", nullable = false, length = 64)
    private String artist;


    @Column(name = "audio_url", nullable = false)
    private String audioUrl;

    @Column
    private Integer duration;

    @Column
    private Integer bpm;

    @Enumerated(EnumType.STRING)
    @Column(name = "key_signature", length = 16)
    private MusicalKey key;

    @Enumerated(EnumType.STRING)
    @Column(name = "scale_type", length = 16)
    private MusicalScale scale;

    @Enumerated(EnumType.STRING)
    @Column(length = 64)
    private Genre genre;

    @Enumerated(EnumType.STRING)
    @Column(name = "instrument_group", length = 32)
    private InstrumentGroup instrumentGroup;

    @Enumerated(EnumType.STRING)
    @Column(name = "sample_type", nullable = false, length = 16)
    private SampleType sampleType;

    @Column(nullable = false)
    private Double price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pack_id")
    private SamplePack pack;

    @ElementCollection
    @CollectionTable(
            name = "audio_sample_tags",
            joinColumns = @JoinColumn(name = "sample_id")
    )
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();


}

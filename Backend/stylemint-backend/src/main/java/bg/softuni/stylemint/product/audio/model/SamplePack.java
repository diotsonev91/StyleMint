package bg.softuni.stylemint.product.audio.model;

import bg.softuni.stylemint.product.audio.enums.Genre;
import bg.softuni.stylemint.product.common.model.BaseProduct;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.UpdateTimestamp;


import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sample_packs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@SuperBuilder
public class SamplePack extends BaseProduct {

    @Column(nullable = false, length = 128)
    private String title;

    @Column(name = "author_id",  nullable = false)
    private UUID authorId;

    @Column(name = "artist", nullable = false, length = 64)
    private String artist;

    @Column(name = "cover_image", nullable = false)
    private String coverImage;

    @Column(nullable = false)
    private Double price;

    @Column(name = "sample_count", nullable = false)
    private Integer sampleCount;

    @Column(name = "total_size", nullable = false, length = 32)
    private String totalSize;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "sample_pack_genres", joinColumns = @JoinColumn(name = "pack_id"))
    @Column(name = "genre", length = 32, nullable = false)
    @Builder.Default
    private List<Genre> genres = new java.util.ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sample_pack_tags", joinColumns = @JoinColumn(name = "pack_id"))
    @Column(name = "tag", length = 32, nullable = false)
    @Builder.Default
    private List<String> tags = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "pack", fetch = FetchType.LAZY)
    @Builder.Default
    private List<AudioSample> samples = new java.util.ArrayList<>();

    @Column
    private Double rating;

    @Column
    private Integer downloads;

    @Column(name = "release_date")
    private OffsetDateTime releaseDate;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;

    private boolean archived = false;
    private OffsetDateTime archivedAt;

    public void addSample(AudioSample sample) {
        samples.add(sample);
        sample.setPack(this);
    }

    public void removeSample(AudioSample sample) {
        samples.remove(sample);
        sample.setPack(null);
    }
}


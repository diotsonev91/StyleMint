package bg.softuni.stylemint.product.audio.model;

import bg.softuni.stylemint.product.audio.enums.Genre;
import bg.softuni.stylemint.product.common.BaseProduct;
import jakarta.persistence.*;
import lombok.*;


import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sample_packs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SamplePack extends BaseProduct {

    @Column(nullable = false, length = 128)
    private String title;

    @Column(name = "author_id", columnDefinition = "BINARY(16)", nullable = false)
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
    private List<Genre> genres;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sample_pack_tags", joinColumns = @JoinColumn(name = "pack_id"))
    @Column(name = "tag", length = 32, nullable = false)
    private List<String> tags;

    @OneToMany(mappedBy = "pack", fetch = FetchType.LAZY)
    private List<AudioSample> samples;

    @Column
    private Double rating;

    @Column
    private Integer downloads;

    @Column(name = "release_date")
    private OffsetDateTime releaseDate;


}

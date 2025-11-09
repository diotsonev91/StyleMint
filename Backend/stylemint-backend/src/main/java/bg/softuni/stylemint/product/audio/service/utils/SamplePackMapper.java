package bg.softuni.stylemint.product.audio.service.utils;

import bg.softuni.stylemint.product.audio.dto.SamplePackDTO;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import org.springframework.stereotype.Component;

@Component
public class SamplePackMapper {

    public SamplePackDTO toDTO(SamplePack pack) {
        return SamplePackDTO.builder()
                .id(pack.getId())
                .title(pack.getTitle())
                .authorId(pack.getAuthorId())
                .artist(pack.getArtist())
                .coverImage(pack.getCoverImage())
                .price(pack.getPrice())
                .sampleCount(pack.getSampleCount())
                .totalSize(pack.getTotalSize())
                .description(pack.getDescription())
                .genres(pack.getGenres())
                .tags(pack.getTags())
                .rating(pack.getRating())
                .downloads(pack.getDownloads())
                .releaseDate(pack.getReleaseDate())
                .createdAt(pack.getCreatedAt())
                .updatedAt(pack.getUpdatedAt())
                .build();
    }
}
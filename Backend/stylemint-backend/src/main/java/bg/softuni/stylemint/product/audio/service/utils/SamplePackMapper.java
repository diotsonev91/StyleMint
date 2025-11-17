package bg.softuni.stylemint.product.audio.service.utils;

import bg.softuni.stylemint.product.audio.dto.AudioSampleDTO;
import bg.softuni.stylemint.product.audio.dto.SamplePackDTO;
import bg.softuni.stylemint.product.audio.model.AudioSample;
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

    public AudioSample mapAudioSampleDtoToEntity(AudioSampleDTO dto) {
        if (dto == null) {
            return null;
        }

        return AudioSample.builder()
                .id(dto.getId())
                .name(dto.getName())
                .authorId(dto.getAuthorId())
                .artist(dto.getArtist())
                .audioUrl(dto.getAudioUrl())
                .duration(dto.getDuration())
                .bpm(dto.getBpm())
                .key(dto.getKey())
                .scale(dto.getScale())
                .genre(dto.getGenre())
                .instrumentGroup(dto.getInstrumentGroup())
                .sampleType(dto.getSampleType())
                .price(dto.getPrice())
                .tags(dto.getTags())
                .build();
    }
}
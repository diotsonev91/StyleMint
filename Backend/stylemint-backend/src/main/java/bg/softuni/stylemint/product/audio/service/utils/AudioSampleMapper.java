package bg.softuni.stylemint.product.audio.service.utils;

import bg.softuni.stylemint.product.audio.dto.AudioSampleDTO;
import bg.softuni.stylemint.product.audio.dto.UploadSampleRequest;
import bg.softuni.stylemint.product.audio.model.AudioSample;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AudioSampleMapper {

    public AudioSampleDTO toDTO(AudioSample sample) {
        return AudioSampleDTO.builder()
                .id(sample.getId())
                .name(sample.getName())
                .authorId(sample.getAuthorId())
                .artist(sample.getArtist())
                .audioUrl(sample.getAudioUrl())
                .duration(sample.getDuration())
                .bpm(sample.getBpm())
                .key(sample.getKey())
                .scale(sample.getScale())
                .genre(sample.getGenre())
                .instrumentGroup(sample.getInstrumentGroup())
                .sampleType(sample.getSampleType())
                .price(sample.getPrice())
                .packId(sample.getPack() != null ? sample.getPack().getId() : null)
                .packTitle(sample.getPack() != null ? sample.getPack().getTitle() : null)
                .createdAt(sample.getCreatedAt())
                .updatedAt(sample.getUpdatedAt())
                // Map tags here
                .tags(sample.getTags() != null ? sample.getTags() : List.of())
                .build();
    }


    public AudioSample toEntity(UploadSampleRequest request) {
        //TODO
       return null;
    }
}

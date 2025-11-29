package bg.softuni.stylemint.product.admin.service;

import bg.softuni.stylemint.product.admin.dto.*;
import bg.softuni.stylemint.product.audio.dto.AudioSampleDTO;
import bg.softuni.stylemint.product.audio.dto.SamplePackDTO;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import bg.softuni.stylemint.product.audio.service.AudioSampleService;
import bg.softuni.stylemint.product.audio.service.SamplePackService;

import bg.softuni.stylemint.product.fashion.dto.DesignPublicDTO;
import bg.softuni.stylemint.product.fashion.service.ClothDesignService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ClothDesignService clothDesignService;
    private final SamplePackService samplePackService;
    private final AudioSampleService audioSampleService;

    /**
     * Paginated cloth designs (admin view)
     */
    public Page<AdminClothDesignDTO> getAllClothDesigns(Pageable pageable) {

        Page<DesignPublicDTO> page = clothDesignService.getPublicDesigns(pageable);

        List<AdminClothDesignDTO> dtoList = page.getContent()
                .stream()
                .map(cd -> new AdminClothDesignDTO(
                        cd.getId().toString(),
                        cd.getLabel(),
                        cd.getClothType().name()
                ))
                .toList();

        return new PageImpl<>(dtoList, pageable, page.getTotalElements());
    }

    /**
     * Paginated audio samples (admin view)
     */
    public Page<AdminSampleDTO> getAllSamples(Pageable pageable) {

        Page<AudioSampleDTO> page = audioSampleService.getStandaloneSamples(pageable);

        List<AdminSampleDTO> dtoList = page.getContent()
                .stream()
                .map(s -> new AdminSampleDTO(
                        s.getId().toString(),
                        s.getName(),
                        s.getArtist()
                ))
                .toList();

        return new PageImpl<>(dtoList, pageable, page.getTotalElements());
    }

    /**
     * Paginated sample packs (admin view)
     */
    public Page<AdminPackDTO> getAllPacks(Pageable pageable) {

        Page<SamplePackDTO> page = samplePackService.getAllPacks(pageable);

        List<AdminPackDTO> dtoList = page.getContent()
                .stream()
                .map(p -> new AdminPackDTO(
                        p.getId().toString(),
                        p.getTitle(),
                        p.getSampleCount()
                ))
                .toList();

        return new PageImpl<>(dtoList, pageable, page.getTotalElements());
    }


    public void adminDeleteDesign(UUID designId){
        clothDesignService.adminDeleteDesign(designId);
    }

    public void adminArchiveSample(UUID sampleId){
        audioSampleService.adminArchiveSample(sampleId);
    };

    public void adminArchivePack(UUID packId){
        samplePackService.adminArchivePack(packId);
    };
}
package bg.softuni.stylemint.product.audio.dto;

import java.util.UUID;

public record SampleDownloadInfo(
        UUID sampleId,
        String fileName,
        String downloadUrl
) {}
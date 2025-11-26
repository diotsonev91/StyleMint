package bg.softuni.stylemint.product.audio.dto;

import java.util.List;
import java.util.UUID;

public record PackDownloadResponse(
        UUID packId,
        String packTitle,
        String packCoverImage,
        List<SampleDownloadInfo> samples,
        boolean isOwner,
        boolean hasLicense
) {}
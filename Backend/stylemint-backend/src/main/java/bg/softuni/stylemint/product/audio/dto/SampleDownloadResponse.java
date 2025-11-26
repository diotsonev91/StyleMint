package bg.softuni.stylemint.product.audio.dto;

public record SampleDownloadResponse(
        String downloadUrl,
        String fileName,
        boolean isOwner,
        boolean hasLicense
) {}

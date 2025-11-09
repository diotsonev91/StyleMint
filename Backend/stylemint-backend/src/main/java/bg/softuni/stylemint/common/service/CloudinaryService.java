package bg.softuni.stylemint.common.service;

import bg.softuni.stylemint.common.exception.FileProcessingException;
import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Upload audio file and return URL + metadata in one response
     */
    public Map<String, Object> uploadAudio(MultipartFile file, UUID userId) {
        try {
            String publicId = "audio/" + userId + "/" + UUID.randomUUID();

            // Upload в Cloudinary връща metadata веднага!
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "video", // Audio files as "video" type
                            "public_id", publicId,
                            "folder", "stylemint/audio",
                            "overwrite", false
                    ));

            log.info("Upload result: {}", uploadResult);

            // Extract data from upload response
            String url = (String) uploadResult.get("secure_url");

            // Duration е в секунди като Double
            Object durationObj = uploadResult.get("duration");
            Double duration = durationObj != null ? ((Number) durationObj).doubleValue() : null;

            String format = (String) uploadResult.get("format");
            Object bytesObj = uploadResult.get("bytes");
            Long bytes = bytesObj != null ? ((Number) bytesObj).longValue() : null;

            log.info("Successfully uploaded audio to Cloudinary: {}", url);
            log.info("Duration: {} seconds, Format: {}, Size: {} bytes", duration, format, bytes);

            // Return everything in one map
            Map<String, Object> result = new HashMap<>();
            result.put("url", url);
            result.put("duration", duration);
            result.put("format", format);
            result.put("bytes", bytes);
            result.put("public_id", uploadResult.get("public_id"));

            return result;

        } catch (IOException e) {
            log.error("Failed to upload audio to Cloudinary: {}", e.getMessage(), e);
            throw new FileProcessingException("Failed to upload audio file: " + e.getMessage());
        }
    }

    /**
     * Upload image to Cloudinary
     */
    public Map<String, Object> uploadImage(MultipartFile file, UUID userId) {
        try {
            String publicId = "images/" + userId + "/" + UUID.randomUUID();

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "image",
                            "public_id", publicId,
                            "folder", "stylemint/images",
                            "quality", "auto",
                            "fetch_format", "auto",
                            "overwrite", false
                    ));

            String url = (String) uploadResult.get("secure_url");
            Integer width = (Integer) uploadResult.get("width");
            Integer height = (Integer) uploadResult.get("height");
            String format = (String) uploadResult.get("format");

            log.info("Successfully uploaded image to Cloudinary: {}", url);

            Map<String, Object> result = new HashMap<>();
            result.put("url", url);
            result.put("width", width);
            result.put("height", height);
            result.put("format", format);
            result.put("public_id", uploadResult.get("public_id"));

            return result;

        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary: {}", e.getMessage(), e);
            throw new FileProcessingException("Failed to upload image: " + e.getMessage());
        }
    }

    /**
     * Upload sample pack cover image
     * FIXED: Flattened transformation parameters to avoid nested map issues
     */
    public String uploadPackCover(MultipartFile file, UUID packId) {
        try {
            String publicId = "pack-covers/" + packId;

            // FIXED: All parameters at the same level, no nested "transformation" map
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "image",
                            "public_id", publicId,
                            "folder", "stylemint/pack-covers",
                            "width", 800,
                            "height", 800,
                            "crop", "fill",
                            "quality", "auto",
                            "fetch_format", "auto",
                            "overwrite", true
                    ));

            String url = (String) uploadResult.get("secure_url");
            log.info("Successfully uploaded pack cover to Cloudinary: {}", url);
            return url;

        } catch (IOException e) {
            log.error("Failed to upload pack cover to Cloudinary: {}", e.getMessage(), e);
            throw new FileProcessingException("Failed to upload pack cover: " + e.getMessage());
        }
    }

    /**
     * Get pack cover URL with CORS (800x800)
     */
    public String getPackCoverUrl(String publicId) {
        return getCorsEnabledImageUrl(publicId, 800, 800);
    }


    public String getCorsEnabledImageUrl(String url, int width, int height) {
        return cloudinary.url()
                .transformation(new Transformation()
                        .width(width)
                        .height(height)
                        .crop("fill")
                        .quality("auto:good")
                        .fetchFormat("auto")
                        .flags("cross_origin")  // ✅ Add CORS flag
                )
                .generate(extractPublicIdFromUrl(url));
    }


    /**
     * Delete file from Cloudinary
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return;
        }

        try {
            String publicId = extractPublicIdFromUrl(fileUrl);
            String resourceType = fileUrl.contains("/video/") ? "video" : "image";

            Map result = cloudinary.uploader().destroy(publicId,
                    ObjectUtils.asMap("resource_type", resourceType));

            log.info("Deleted file from Cloudinary: {}, Result: {}", publicId, result.get("result"));

        } catch (Exception e) {
            log.error("Failed to delete file from Cloudinary: {}", e.getMessage(), e);
            // Don't throw exception on delete failure - just log it
            log.warn("Continuing despite delete failure");
        }
    }

    /**
     * Get existing resource metadata (за update случаи)
     */
    public Map<String, Object> getResourceMetadata(String fileUrl) {
        try {
            String publicId = extractPublicIdFromUrl(fileUrl);
            String resourceType = fileUrl.contains("/video/") ? "video" : "image";

            Map resource = cloudinary.api().resource(publicId,
                    ObjectUtils.asMap("resource_type", resourceType));

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("duration", resource.get("duration"));
            metadata.put("format", resource.get("format"));
            metadata.put("bytes", resource.get("bytes"));
            metadata.put("width", resource.get("width"));
            metadata.put("height", resource.get("height"));

            return metadata;

        } catch (Exception e) {
            log.error("Failed to get resource metadata: {}", e.getMessage(), e);
            return new HashMap<>(); // Return empty map instead of throwing
        }
    }

    // Helper methods

    private String extractPublicIdFromUrl(String url) {
        try {
            // https://res.cloudinary.com/demo/video/upload/v1234567890/stylemint/audio/user-id/file.mp3
            String[] parts = url.split("/upload/");
            if (parts.length < 2) {
                throw new IllegalArgumentException("Invalid Cloudinary URL format");
            }

            String pathAfterUpload = parts[1];
            String publicIdWithExtension = pathAfterUpload.replaceFirst("v\\d+/", "");

            int lastDotIndex = publicIdWithExtension.lastIndexOf('.');
            if (lastDotIndex > 0) {
                return publicIdWithExtension.substring(0, lastDotIndex);
            }

            return publicIdWithExtension;
        } catch (Exception e) {
            log.error("Failed to extract public_id from URL: {}", url, e);
            throw new IllegalArgumentException("Invalid Cloudinary URL: " + url);
        }
    }
}
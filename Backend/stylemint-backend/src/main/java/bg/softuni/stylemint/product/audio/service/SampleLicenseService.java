package bg.softuni.stylemint.product.audio.service;


import bg.softuni.stylemint.product.audio.dto.AudioSampleDTO;


import java.util.List;
import java.util.UUID;

public interface SampleLicenseService {

    /**
     * Processes order fulfillment and grants sample licenses
     * to the purchasing user for all eligible items.
     *
     */
    void processOrderFulfillment(UUID orderId, UUID userId);

    /**
     * Checks whether a user has a valid license for a given audio sample.
     *
     * @param userId   ID of the user.
     * @param sampleId ID of the audio sample.
     * @return true if the user owns a license for this sample.
     */
    boolean canDownloadSample(UUID userId, UUID sampleId);

    /**
     * Retrieves all audio samples licensed to the given user.
     *
     * @param userId ID of the user.
     * @return List of licensed AudioSample entities.
     */
    List<AudioSampleDTO> getUserSampleLibrary(UUID userId);
}

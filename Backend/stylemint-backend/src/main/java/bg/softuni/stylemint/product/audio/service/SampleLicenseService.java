package bg.softuni.stylemint.product.audio.service;


import bg.softuni.dtos.order.OrderItemDTO;
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


    void validateDownloadPermission(UUID userId, UUID sampleId);


    void validateDownloadPermissionPack(UUID userId, UUID packId);
    /**
     * Retrieves all audio samples licensed to the given user.
     *
     * @param userId ID of the user.
     * @return List of licensed AudioSample entities.
     */
    List<AudioSampleDTO> getUserSampleLibrary(UUID userId);

    void createLicenseForPaidItem(UUID userId, OrderItemDTO item);

}

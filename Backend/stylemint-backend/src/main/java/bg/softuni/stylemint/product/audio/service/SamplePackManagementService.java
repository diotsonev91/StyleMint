package bg.softuni.stylemint.product.audio.service;

import bg.softuni.stylemint.product.audio.dto.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.math.BigDecimal;

/**
 * Service interface for managing audio sample packs and their samples.
 */
public interface SamplePackManagementService {

    /**
     * Uploads a new sample pack along with its samples and cover image.
     *
     * @param authorId The ID of the author uploading the pack.
     * @param request  The upload request containing pack metadata and sample files.
     * @return The uploaded sample pack as a DTO.
     */
    SamplePackDTO uploadPack(UUID authorId, UploadPackRequest request);

    /**
     * Updates an existing sample pack and optionally adds/removes samples.
     *
     * @param packId   The ID of the pack to update.
     * @param authorId The ID of the author performing the update.
     * @param request  The update request containing new metadata and sample changes.
     * @return The updated sample pack as a DTO.
     */
    SamplePackDTO updatePack(UUID packId, UUID authorId, UpdatePackRequest request);

    /**
     * Deletes a sample pack and all associated samples.
     *
     * @param packId   The ID of the pack to delete.
     * @param authorId The ID of the author performing the deletion.
     */
    void deletePack(UUID packId, UUID authorId);

    /**
     * Adds existing standalone samples to a sample pack.
     *
     * @param packId    The ID of the target pack.
     * @param authorId  The ID of the author performing the operation.
     * @param sampleIds The IDs of the samples to add.
     */
}

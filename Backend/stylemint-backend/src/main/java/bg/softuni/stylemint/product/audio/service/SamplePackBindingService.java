package bg.softuni.stylemint.product.audio.service;

import java.util.List;
import java.util.UUID;

/**
 * Service for binding/unbinding audio samples to/from sample packs
 */
public interface SamplePackBindingService {

    /**
     * Bind a single sample to a pack
     *
     * @param sampleId ID of the sample to bind
     * @param packId ID of the pack to bind to
     * @param authorId ID of the author (for authorization)
     */
    void bindSampleToPack(UUID sampleId, UUID packId, UUID authorId);

    /**
     * Bind multiple samples to a pack
     *
     * @param packId ID of the pack to bind to
     * @param authorId ID of the author (for authorization)
     * @param sampleIds List of sample IDs to bind
     */
    void bindSamplesToPack(UUID packId, UUID authorId, List<UUID> sampleIds);

    /**
     * Unbind a sample from its pack (make it standalone)
     *
     * @param sampleId ID of the sample to unbind
     * @param authorId ID of the author (for authorization)
     */
    void unbindSampleFromPack(UUID sampleId, UUID packId, UUID authorId);
}
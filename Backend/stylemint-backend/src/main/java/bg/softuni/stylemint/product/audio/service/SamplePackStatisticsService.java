package bg.softuni.stylemint.product.audio.service;

import bg.softuni.stylemint.product.audio.model.SamplePack;

public interface SamplePackStatisticsService {

    /**
     * Recalculate pack statistics (sample count, average BPM, total duration)
     */
    void recalculatePackStatistics(SamplePack pack);

    /**
     * Update pack total size by adding additional bytes
     */
    void updateTotalSize(SamplePack pack, long additionalBytes);
}

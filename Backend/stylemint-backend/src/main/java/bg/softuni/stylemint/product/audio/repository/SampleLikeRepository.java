package bg.softuni.stylemint.product.audio.repository;

import bg.softuni.stylemint.product.audio.model.SampleLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SampleLikeRepository extends JpaRepository<SampleLike, UUID> {

    boolean existsByUserIdAndAudioSampleId(UUID userId, UUID sampleId);

    long countByAudioSampleId(UUID sampleId);

    void deleteByUserIdAndAudioSampleId(UUID userId, UUID sampleId);

    @Query("SELECT l.audioSample.id as sampleId, COUNT(l) as count " +
            "FROM SampleLike l " +
            "WHERE l.audioSample.id IN :sampleIds " +
            "GROUP BY l.audioSample.id")
    List<SampleLikeCountProjection> countByAudioSampleIdIn(@Param("sampleIds") List<UUID> sampleIds);

    void deleteByAudioSampleId(UUID sampleId);
}

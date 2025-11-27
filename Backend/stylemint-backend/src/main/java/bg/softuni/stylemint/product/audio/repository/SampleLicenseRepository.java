package bg.softuni.stylemint.product.audio.repository;

import bg.softuni.stylemint.product.audio.model.AudioSample;
import bg.softuni.stylemint.product.audio.model.SampleLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SampleLicenseRepository extends JpaRepository<SampleLicense, UUID> {
    boolean existsByUserIdAndAudioSampleId(UUID userId, UUID sampleId);

    @Query("SELECT sl.audioSample FROM SampleLicense sl WHERE sl.user.id = :userId")
    List<AudioSample> findAudioSamplesByUserIdAndArchivedFalse(@Param("userId") UUID userId);

    List<SampleLicense> findByUserId(UUID userId);

    Optional<SampleLicense> findByUserIdAndAudioSampleId(UUID userId, UUID sampleId);
}

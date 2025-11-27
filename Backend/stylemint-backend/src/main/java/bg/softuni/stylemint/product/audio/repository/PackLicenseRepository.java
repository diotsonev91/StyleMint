package bg.softuni.stylemint.product.audio.repository;

import bg.softuni.stylemint.product.audio.model.PackLicense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PackLicenseRepository extends JpaRepository<PackLicense, UUID> {

    boolean existsByUserIdAndPackIdAndArchivedFalse(UUID userId, UUID packId);

    List<PackLicense> findByArchivedTrue();

    boolean existsByUserIdAndPackId(UUID userId, UUID packId);

    Optional<PackLicense> findByUserIdAndPackId(UUID userId, UUID packId);
}

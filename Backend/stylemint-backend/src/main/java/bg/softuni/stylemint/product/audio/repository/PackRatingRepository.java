package bg.softuni.stylemint.product.audio.repository;

import aj.org.objectweb.asm.commons.Remapper;
import bg.softuni.stylemint.product.audio.model.PackRating;
import bg.softuni.stylemint.product.audio.model.SamplePack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PackRatingRepository extends JpaRepository<PackRating, UUID> {
    List<PackRating> findBySamplePack(SamplePack samplePack);

    Optional<PackRating> findBySamplePackAndUserId(SamplePack pack, UUID currentUserId);
}


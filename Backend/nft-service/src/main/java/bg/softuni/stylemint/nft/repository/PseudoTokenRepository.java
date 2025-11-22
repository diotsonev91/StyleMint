// PseudoTokenRepository.java
package bg.softuni.stylemint.nft.repository;

import bg.softuni.stylemint.nft.model.PseudoToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PseudoTokenRepository extends MongoRepository<PseudoToken, String> {
    List<PseudoToken> findByOwnerId(UUID ownerId);
    Optional<PseudoToken> findByTokenId(UUID tokenId);
}
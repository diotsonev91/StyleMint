// BlockRepository.java
package bg.softuni.stylemint.blockchain.repository;

import bg.softuni.stylemint.blockchain.model.Block;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface BlockRepository extends MongoRepository<Block, String> {
    Optional<Block> findTopByOrderByIndexDesc();
    Optional<Block> findByHash(String hash);

    List<Block> findAllByOrderByIndexAsc();
}
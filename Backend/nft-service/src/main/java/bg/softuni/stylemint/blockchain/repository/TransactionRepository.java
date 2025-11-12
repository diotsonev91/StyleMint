// TransactionRepository.java
package bg.softuni.stylemint.blockchain.repository;

import bg.softuni.stylemint.blockchain.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findByStatus(Transaction.TransactionStatus status);
    List<Transaction> findByToUserId(UUID userId);
    List<Transaction> findByFromUserId(UUID userId);
}
// TransactionService.java
package bg.softuni.stylemint.blockchain.service;

import bg.softuni.stylemint.blockchain.model.Transaction;
import bg.softuni.stylemint.blockchain.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final BlockchainService blockchainService;

    public void processTransaction(Transaction transaction) {
        // Save pending transaction
        transactionRepository.save(transaction);

        // In a real scenario, you might batch transactions
        // For simplicity, we'll create a block for each transaction
        List<Transaction> transactions = List.of(transaction);
        blockchainService.createNewBlock(transactions);
    }

    public List<Transaction> getPendingTransactions() {
        return transactionRepository.findByStatus(Transaction.TransactionStatus.PENDING);
    }
}
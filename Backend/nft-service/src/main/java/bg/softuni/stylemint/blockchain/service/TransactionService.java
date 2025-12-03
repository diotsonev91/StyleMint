// TransactionService.java
package bg.softuni.stylemint.blockchain.service;

import bg.softuni.stylemint.blockchain.model.Transaction;
import bg.softuni.stylemint.blockchain.repository.TransactionRepository;
import bg.softuni.stylemint.nft.exception.TransactionProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final BlockchainService blockchainService;

    @Transactional
    public void processTransaction(Transaction transaction) {
        try {
            transactionRepository.save(transaction);

            List<Transaction> transactions = List.of(transaction);
            blockchainService.createNewBlock(transactions);
        }catch (Exception e){
            throw new TransactionProcessingException("Transaction processing failed");
        }
    }

    public List<Transaction> getPendingTransactions() {
        return transactionRepository.findByStatus(Transaction.TransactionStatus.PENDING);
    }
}
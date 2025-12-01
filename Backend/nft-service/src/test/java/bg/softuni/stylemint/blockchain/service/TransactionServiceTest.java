package bg.softuni.stylemint.blockchain.service;

import bg.softuni.stylemint.blockchain.model.Block;
import bg.softuni.stylemint.blockchain.model.Transaction;
import bg.softuni.stylemint.blockchain.repository.TransactionRepository;
import bg.softuni.dtos.enums.nft.NftType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private BlockchainService blockchainService;

    @InjectMocks
    private TransactionService transactionService;

    private Transaction testTransaction;
    private Block testBlock;

    @BeforeEach
    void setUp() {
        testTransaction = new Transaction();
        testTransaction.setFromUserId(UUID.randomUUID());
        testTransaction.setToUserId(UUID.randomUUID());
        testTransaction.setTokenId(UUID.randomUUID());
        testTransaction.setNftType(NftType.AUTHOR_BADGE_DESIGNER);
        testTransaction.setTransactionType(Transaction.TransactionType.MINT);
        testTransaction.setStatus(Transaction.TransactionStatus.PENDING);

        testBlock = new Block();
        testBlock.setIndex(1L);
        testBlock.setHash("test_block_hash");
        testBlock.setTransactions(new ArrayList<>());
    }

    @Test
    void processTransaction_ShouldSaveTransaction() {
        // Arrange
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);
        when(blockchainService.createNewBlock(anyList())).thenReturn(testBlock);

        // Act
        transactionService.processTransaction(testTransaction);

        // Assert
        verify(transactionRepository, times(1)).save(testTransaction);
    }

    @Test
    void processTransaction_ShouldCreateNewBlock() {
        // Arrange
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);
        when(blockchainService.createNewBlock(anyList())).thenReturn(testBlock);

        // Act
        transactionService.processTransaction(testTransaction);

        // Assert
        verify(blockchainService, times(1)).createNewBlock(anyList());
    }

    @Test
    void processTransaction_ShouldCreateBlockWithSingleTransaction() {
        // Arrange
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);
        when(blockchainService.createNewBlock(anyList())).thenReturn(testBlock);

        // Act
        transactionService.processTransaction(testTransaction);

        // Assert
        verify(blockchainService, times(1)).createNewBlock(argThat(transactions -> 
            transactions != null && 
            transactions.size() == 1 && 
            transactions.get(0).equals(testTransaction)
        ));
    }

    @Test
    void processTransaction_ShouldHandleMintTransaction() {
        // Arrange
        testTransaction.setTransactionType(Transaction.TransactionType.MINT);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);
        when(blockchainService.createNewBlock(anyList())).thenReturn(testBlock);

        // Act
        transactionService.processTransaction(testTransaction);

        // Assert
        verify(transactionRepository, times(1)).save(testTransaction);
        verify(blockchainService, times(1)).createNewBlock(anyList());
    }

    @Test
    void processTransaction_ShouldHandleTransferTransaction() {
        // Arrange
        testTransaction.setTransactionType(Transaction.TransactionType.TRANSFER);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);
        when(blockchainService.createNewBlock(anyList())).thenReturn(testBlock);

        // Act
        transactionService.processTransaction(testTransaction);

        // Assert
        verify(transactionRepository, times(1)).save(testTransaction);
        verify(blockchainService, times(1)).createNewBlock(anyList());
    }

    @Test
    void processTransaction_ShouldHandleDifferentNftTypes() {
        // Arrange
        testTransaction.setNftType(NftType.NFT_DISCOUNT_5);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);
        when(blockchainService.createNewBlock(anyList())).thenReturn(testBlock);

        // Act
        transactionService.processTransaction(testTransaction);

        // Assert
        verify(transactionRepository, times(1)).save(testTransaction);
        verify(blockchainService, times(1)).createNewBlock(anyList());
    }

    @Test
    void processTransaction_ShouldMaintainTransactionOrder() {
        // Arrange
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);
        when(blockchainService.createNewBlock(anyList())).thenReturn(testBlock);

        // Act
        transactionService.processTransaction(testTransaction);

        // Assert
        // Verify save is called before createNewBlock
        var inOrder = inOrder(transactionRepository, blockchainService);
        inOrder.verify(transactionRepository).save(testTransaction);
        inOrder.verify(blockchainService).createNewBlock(anyList());
    }

    @Test
    void getPendingTransactions_ShouldReturnPendingTransactions() {
        // Arrange
        Transaction tx1 = new Transaction();
        tx1.setStatus(Transaction.TransactionStatus.PENDING);
        
        Transaction tx2 = new Transaction();
        tx2.setStatus(Transaction.TransactionStatus.PENDING);
        
        List<Transaction> pendingTransactions = List.of(tx1, tx2);
        when(transactionRepository.findByStatus(Transaction.TransactionStatus.PENDING))
            .thenReturn(pendingTransactions);

        // Act
        List<Transaction> result = transactionService.getPendingTransactions();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(pendingTransactions, result);
        verify(transactionRepository, times(1))
            .findByStatus(Transaction.TransactionStatus.PENDING);
    }

    @Test
    void getPendingTransactions_ShouldReturnEmptyList_WhenNoPendingTransactions() {
        // Arrange
        when(transactionRepository.findByStatus(Transaction.TransactionStatus.PENDING))
            .thenReturn(new ArrayList<>());

        // Act
        List<Transaction> result = transactionService.getPendingTransactions();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(transactionRepository, times(1))
            .findByStatus(Transaction.TransactionStatus.PENDING);
    }

    @Test
    void getPendingTransactions_ShouldNotReturnConfirmedTransactions() {
        // Arrange
        Transaction pendingTx = new Transaction();
        pendingTx.setStatus(Transaction.TransactionStatus.PENDING);
        
        List<Transaction> transactions = List.of(pendingTx);
        when(transactionRepository.findByStatus(Transaction.TransactionStatus.PENDING))
            .thenReturn(transactions);

        // Act
        List<Transaction> result = transactionService.getPendingTransactions();

        // Assert
        assertTrue(result.stream()
            .allMatch(tx -> tx.getStatus() == Transaction.TransactionStatus.PENDING));
    }

    @Test
    void getPendingTransactions_ShouldNotReturnFailedTransactions() {
        // Arrange
        when(transactionRepository.findByStatus(Transaction.TransactionStatus.PENDING))
            .thenReturn(new ArrayList<>());

        // Act
        List<Transaction> result = transactionService.getPendingTransactions();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(transactionRepository, never())
            .findByStatus(Transaction.TransactionStatus.FAILED);
        verify(transactionRepository, never())
            .findByStatus(Transaction.TransactionStatus.CONFIRMED);
    }

    @Test
    void processTransaction_ShouldHandleNullTokenId() {
        // Arrange
        testTransaction.setTokenId(null);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);
        when(blockchainService.createNewBlock(anyList())).thenReturn(testBlock);

        // Act & Assert
        assertDoesNotThrow(() -> transactionService.processTransaction(testTransaction));
        verify(transactionRepository, times(1)).save(testTransaction);
    }

    @Test
    void processTransaction_ShouldPreserveTransactionId() {
        // Arrange
        UUID originalTransactionId = testTransaction.getTransactionId();
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);
        when(blockchainService.createNewBlock(anyList())).thenReturn(testBlock);

        // Act
        transactionService.processTransaction(testTransaction);

        // Assert
        verify(transactionRepository, times(1)).save(argThat(tx -> 
            tx.getTransactionId().equals(originalTransactionId)
        ));
    }

    @Test
    void processTransaction_ShouldPreserveTimestamp() {
        // Arrange
        Long originalTimestamp = testTransaction.getTimestamp();
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);
        when(blockchainService.createNewBlock(anyList())).thenReturn(testBlock);

        // Act
        transactionService.processTransaction(testTransaction);

        // Assert
        verify(transactionRepository, times(1)).save(argThat(tx -> 
            tx.getTimestamp().equals(originalTimestamp)
        ));
    }

    @Test
    void getPendingTransactions_ShouldReturnMultipleTransactions() {
        // Arrange
        List<Transaction> pendingTransactions = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            Transaction tx = new Transaction();
            tx.setStatus(Transaction.TransactionStatus.PENDING);
            pendingTransactions.add(tx);
        }
        
        when(transactionRepository.findByStatus(Transaction.TransactionStatus.PENDING))
            .thenReturn(pendingTransactions);

        // Act
        List<Transaction> result = transactionService.getPendingTransactions();

        // Assert
        assertEquals(5, result.size());
    }

    @Test
    void processTransaction_WithCompleteTransactionData() {
        // Arrange
        testTransaction.setFromUserId(UUID.randomUUID());
        testTransaction.setToUserId(UUID.randomUUID());
        testTransaction.setTokenId(UUID.randomUUID());
        testTransaction.setNftType(NftType.NFT_DISCOUNT_7);
        testTransaction.setTransactionType(Transaction.TransactionType.TRANSFER);
        
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);
        when(blockchainService.createNewBlock(anyList())).thenReturn(testBlock);

        // Act
        transactionService.processTransaction(testTransaction);

        // Assert
        verify(transactionRepository, times(1)).save(testTransaction);
        verify(blockchainService, times(1)).createNewBlock(anyList());
    }
}

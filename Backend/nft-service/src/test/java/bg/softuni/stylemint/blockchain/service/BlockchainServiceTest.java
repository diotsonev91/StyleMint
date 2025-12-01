package bg.softuni.stylemint.blockchain.service;

import bg.softuni.stylemint.blockchain.config.BlockchainProperties;
import bg.softuni.stylemint.blockchain.model.Block;
import bg.softuni.stylemint.blockchain.model.Transaction;
import bg.softuni.stylemint.blockchain.repository.BlockRepository;
import bg.softuni.stylemint.blockchain.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BlockchainServiceTest {

    @Mock
    private BlockRepository blockRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private ProofOfWorkService proofOfWorkService;

    @Mock
    private BlockchainProperties blockchainProperties;

    @InjectMocks
    private BlockchainService blockchainService;

    private Block genesisBlock;
    private Block secondBlock;
    private Transaction testTransaction;

    @BeforeEach
    void setUp() {
        // Setup genesis block
        genesisBlock = new Block();
        genesisBlock.setIndex(0L);
        genesisBlock.setPreviousHash("0");
        genesisBlock.setHash("genesis_hash");
        genesisBlock.setTransactions(new ArrayList<>());
        genesisBlock.setDifficulty(4);
        genesisBlock.setNonce(12345);

        // Setup second block
        secondBlock = new Block();
        secondBlock.setIndex(1L);
        secondBlock.setPreviousHash("genesis_hash");
        secondBlock.setHash("second_block_hash");
        secondBlock.setTransactions(new ArrayList<>());
        secondBlock.setDifficulty(4);
        secondBlock.setNonce(67890);

        // Setup test transaction
        testTransaction = new Transaction();
        testTransaction.setStatus(Transaction.TransactionStatus.PENDING);
    }

    @Test
    void init_ShouldCreateGenesisBlock_WhenBlockchainIsEmpty() {
        // Arrange
        when(blockchainProperties.getDifficulty()).thenReturn(4);
        when(blockRepository.count()).thenReturn(0L);
        when(blockRepository.save(any(Block.class))).thenReturn(genesisBlock);

        // Act
        blockchainService.init();

        // Assert
        verify(blockRepository, times(1)).count();
        verify(blockRepository, times(1)).save(any(Block.class));
        verify(proofOfWorkService, times(1)).mineBlock(any(Block.class), eq(4));
    }

    @Test
    void init_ShouldNotCreateGenesisBlock_WhenBlockchainExists() {
        // Arrange
        when(blockchainProperties.getDifficulty()).thenReturn(4);
        when(blockRepository.count()).thenReturn(5L);

        // Act
        blockchainService.init();

        // Assert
        verify(blockRepository, times(1)).count();
        verify(blockRepository, never()).save(any(Block.class));
        verify(proofOfWorkService, never()).mineBlock(any(Block.class), anyInt());
    }

    @Test
    void createNewBlock_ShouldCreateBlockWithCorrectIndex_WhenBlockchainHasBlocks() {
        // Arrange
        List<Transaction> transactions = List.of(testTransaction);
        when(blockRepository.findTopByOrderByIndexDesc()).thenReturn(Optional.of(genesisBlock));
        when(blockRepository.save(any(Block.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Block result = blockchainService.createNewBlock(transactions);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getIndex());
        assertEquals("genesis_hash", result.getPreviousHash());
        verify(proofOfWorkService, times(1)).mineBlock(any(Block.class), anyInt());
        verify(transactionRepository, times(1)).save(testTransaction);
        assertEquals(Transaction.TransactionStatus.CONFIRMED, testTransaction.getStatus());
    }

    @Test
    void createNewBlock_ShouldCreateBlockWithIndexZero_WhenBlockchainIsEmpty() {
        // Arrange
        List<Transaction> transactions = List.of(testTransaction);
        when(blockRepository.findTopByOrderByIndexDesc()).thenReturn(Optional.empty());
        when(blockRepository.save(any(Block.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Block result = blockchainService.createNewBlock(transactions);

        // Assert
        assertNotNull(result);
        assertEquals(0L, result.getIndex());
        assertEquals("0", result.getPreviousHash());
        verify(proofOfWorkService, times(1)).mineBlock(any(Block.class), anyInt());
    }

    @Test
    void createNewBlock_ShouldSetTransactionStatus_ToConfirmed() {
        // Arrange
        List<Transaction> transactions = List.of(testTransaction);

        // Създаваме мокнат genesisBlock с хеш
        Block genesisBlock = new Block();
        genesisBlock.setIndex(0L);
        genesisBlock.setHash("genesis_hash");

        when(blockRepository.findTopByOrderByIndexDesc()).thenReturn(Optional.of(genesisBlock));

        doAnswer(invocation -> {
            Block block = invocation.getArgument(0);
            block.setHash("new_block_hash"); // Директно задаваме хеша
            return null;
        }).when(proofOfWorkService).mineBlock(any(Block.class), anyInt());

        when(blockRepository.save(any(Block.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        blockchainService.createNewBlock(transactions);

        // Assert
        assertEquals(Transaction.TransactionStatus.CONFIRMED, testTransaction.getStatus());
        assertEquals("new_block_hash", testTransaction.getBlockHash());
    }

    @Test
    void createNewBlock_ShouldHandleMultipleTransactions() {
        // Arrange
        Transaction tx1 = new Transaction();
        Transaction tx2 = new Transaction();
        Transaction tx3 = new Transaction();
        List<Transaction> transactions = List.of(tx1, tx2, tx3);

        when(blockRepository.findTopByOrderByIndexDesc()).thenReturn(Optional.of(genesisBlock));
        when(blockRepository.save(any(Block.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Block result = blockchainService.createNewBlock(transactions);

        // Assert
        assertNotNull(result);
        assertEquals(3, result.getTransactions().size());
        verify(transactionRepository, times(3)).save(any(Transaction.class));
    }

    @Test
    void isChainValid_ShouldReturnTrue_WhenChainIsValid() {
        // Arrange
        List<Block> blocks = List.of(genesisBlock, secondBlock);
        when(blockRepository.findAllByOrderByIndexAsc()).thenReturn(blocks);
        when(proofOfWorkService.validateBlock(secondBlock)).thenReturn(true);

        // Act
        boolean result = blockchainService.isChainValid();

        // Assert
        assertTrue(result);
        verify(proofOfWorkService, times(1)).validateBlock(secondBlock);
    }

    @Test
    void isChainValid_ShouldReturnFalse_WhenPreviousHashMismatch() {
        // Arrange
        secondBlock.setPreviousHash("wrong_hash");
        List<Block> blocks = List.of(genesisBlock, secondBlock);
        when(blockRepository.findAllByOrderByIndexAsc()).thenReturn(blocks);

        // Act
        boolean result = blockchainService.isChainValid();

        // Assert
        assertFalse(result);
        verify(proofOfWorkService, never()).validateBlock(any(Block.class));
    }

    @Test
    void isChainValid_ShouldReturnFalse_WhenBlockValidationFails() {
        // Arrange
        List<Block> blocks = List.of(genesisBlock, secondBlock);
        when(blockRepository.findAllByOrderByIndexAsc()).thenReturn(blocks);
        when(proofOfWorkService.validateBlock(secondBlock)).thenReturn(false);

        // Act
        boolean result = blockchainService.isChainValid();

        // Assert
        assertFalse(result);
        verify(proofOfWorkService, times(1)).validateBlock(secondBlock);
    }

    @Test
    void isChainValid_ShouldReturnTrue_WhenOnlyGenesisBlockExists() {
        // Arrange
        List<Block> blocks = List.of(genesisBlock);
        when(blockRepository.findAllByOrderByIndexAsc()).thenReturn(blocks);

        // Act
        boolean result = blockchainService.isChainValid();

        // Assert
        assertTrue(result);
        verify(proofOfWorkService, never()).validateBlock(any(Block.class));
    }

    @Test
    void isChainValid_ShouldValidateEntireChain() {
        // Arrange
        Block thirdBlock = new Block();
        thirdBlock.setIndex(2L);
        thirdBlock.setPreviousHash("second_block_hash");
        thirdBlock.setHash("third_block_hash");
        thirdBlock.setDifficulty(4);

        List<Block> blocks = List.of(genesisBlock, secondBlock, thirdBlock);
        when(blockRepository.findAllByOrderByIndexAsc()).thenReturn(blocks);
        when(proofOfWorkService.validateBlock(any(Block.class))).thenReturn(true);

        // Act
        boolean result = blockchainService.isChainValid();

        // Assert
        assertTrue(result);
        verify(proofOfWorkService, times(2)).validateBlock(any(Block.class));
    }
}

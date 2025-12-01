package bg.softuni.stylemint.blockchain.service;

import bg.softuni.stylemint.blockchain.model.Block;
import bg.softuni.stylemint.blockchain.model.Transaction;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ProofOfWorkServiceTest {

    @InjectMocks
    private ProofOfWorkService proofOfWorkService;

    private Block testBlock;

    @BeforeEach
    void setUp() {
        testBlock = new Block();
        testBlock.setIndex(1L);
        testBlock.setPreviousHash("previous_hash");
        testBlock.setTransactions(new ArrayList<>());
        testBlock.setDifficulty(2);
        testBlock.setNonce(0);
    }

    @Test
    void calculateHash_ShouldReturnConsistentHash_ForSameBlockData() {
        // Act
        String hash1 = proofOfWorkService.calculateHash(testBlock);
        String hash2 = proofOfWorkService.calculateHash(testBlock);

        // Assert
        assertNotNull(hash1);
        assertNotNull(hash2);
        assertEquals(hash1, hash2);
        assertEquals(64, hash1.length()); // SHA-256 produces 64 hex characters
    }

    @Test
    void calculateHash_ShouldReturnDifferentHash_WhenNonceChanges() {
        // Arrange
        testBlock.setNonce(0);
        String hash1 = proofOfWorkService.calculateHash(testBlock);

        testBlock.setNonce(1);
        String hash2 = proofOfWorkService.calculateHash(testBlock);

        // Assert
        assertNotEquals(hash1, hash2);
    }

    @Test
    void calculateHash_ShouldReturnDifferentHash_WhenIndexChanges() {
        // Arrange
        testBlock.setIndex(1L);
        String hash1 = proofOfWorkService.calculateHash(testBlock);

        testBlock.setIndex(2L);
        String hash2 = proofOfWorkService.calculateHash(testBlock);

        // Assert
        assertNotEquals(hash1, hash2);
    }

    @Test
    void calculateHash_ShouldReturnDifferentHash_WhenPreviousHashChanges() {
        // Arrange
        testBlock.setPreviousHash("hash1");
        String hash1 = proofOfWorkService.calculateHash(testBlock);

        testBlock.setPreviousHash("hash2");
        String hash2 = proofOfWorkService.calculateHash(testBlock);

        // Assert
        assertNotEquals(hash1, hash2);
    }

    @Test
    void calculateHash_ShouldReturnDifferentHash_WhenTransactionsChange() {
        // Arrange
        testBlock.setTransactions(new ArrayList<>());
        String hash1 = proofOfWorkService.calculateHash(testBlock);

        Transaction tx = new Transaction();
        testBlock.setTransactions(List.of(tx));
        String hash2 = proofOfWorkService.calculateHash(testBlock);

        // Assert
        assertNotEquals(hash1, hash2);
    }

    @Test
    void mineBlock_ShouldFindValidHash_WithDifficulty2() {
        // Act
        proofOfWorkService.mineBlock(testBlock, 2);

        // Assert
        assertNotNull(testBlock.getHash());
        assertTrue(testBlock.getHash().startsWith("00"));
        assertTrue(testBlock.getNonce() > 0);
    }

    @Test
    void mineBlock_ShouldFindValidHash_WithDifficulty3() {
        // Act
        proofOfWorkService.mineBlock(testBlock, 3);

        // Assert
        assertNotNull(testBlock.getHash());
        assertTrue(testBlock.getHash().startsWith("000"));
        assertTrue(testBlock.getNonce() > 0);
    }

    @Test
    void mineBlock_ShouldFindValidHash_WithDifficulty1() {
        // Act
        proofOfWorkService.mineBlock(testBlock, 1);

        // Assert
        assertNotNull(testBlock.getHash());
        assertTrue(testBlock.getHash().startsWith("0"));
        assertTrue(testBlock.getNonce() >= 0);
    }

    @Test
    void mineBlock_ShouldSetHashBeforeMining() {
        // Act
        proofOfWorkService.mineBlock(testBlock, 2);

        // Assert
        assertNotNull(testBlock.getHash());
        assertNotEquals("", testBlock.getHash());
    }

    @Test
    void mineBlock_ShouldIncreaseNonceUntilValidHashFound() {
        // Arrange
        int initialNonce = testBlock.getNonce();

        // Act
        proofOfWorkService.mineBlock(testBlock, 2);

        // Assert
        assertTrue(testBlock.getNonce() > initialNonce);
    }

    @Test
    void mineBlock_MinedHashShouldMatchCalculatedHash() {
        // Act
        proofOfWorkService.mineBlock(testBlock, 2);
        String minedHash = testBlock.getHash();
        String calculatedHash = proofOfWorkService.calculateHash(testBlock);

        // Assert
        assertEquals(minedHash, calculatedHash);
    }

    @Test
    void validateBlock_ShouldReturnTrue_ForValidBlock() {
        // Arrange
        proofOfWorkService.mineBlock(testBlock, 2);

        // Act
        boolean result = proofOfWorkService.validateBlock(testBlock);

        // Assert
        assertTrue(result);
    }

    @Test
    void validateBlock_ShouldReturnFalse_WhenHashIsManipulated() {
        // Arrange
        proofOfWorkService.mineBlock(testBlock, 2);
        testBlock.setHash("manipulated_hash");

        // Act
        boolean result = proofOfWorkService.validateBlock(testBlock);

        // Assert
        assertFalse(result);
    }

    @Test
    void validateBlock_ShouldReturnFalse_WhenNonceIsChanged() {
        // Arrange
        proofOfWorkService.mineBlock(testBlock, 2);
        int originalNonce = testBlock.getNonce();
        testBlock.setNonce(originalNonce + 1);

        // Act
        boolean result = proofOfWorkService.validateBlock(testBlock);

        // Assert
        assertFalse(result);
    }

    @Test
    void validateBlock_ShouldReturnFalse_WhenDataIsModified() {
        // Arrange
        proofOfWorkService.mineBlock(testBlock, 2);
        testBlock.setPreviousHash("modified_hash");

        // Act
        boolean result = proofOfWorkService.validateBlock(testBlock);

        // Assert
        assertFalse(result);
    }

    @Test
    void calculateHash_ShouldProduceValidSHA256Hash() {
        // Act
        String hash = proofOfWorkService.calculateHash(testBlock);

        // Assert
        assertNotNull(hash);
        assertEquals(64, hash.length());
        assertTrue(hash.matches("[a-f0-9]{64}")); // Hex characters only
    }

    @Test
    void mineBlock_WithZeroDifficulty_ShouldCompleteImmediately() {
        // Act
        proofOfWorkService.mineBlock(testBlock, 0);

        // Assert
        assertNotNull(testBlock.getHash());
        // With 0 difficulty, any hash is valid (no leading zeros required)
    }

    @Test
    void calculateHash_ShouldHandleEmptyTransactionList() {
        // Arrange
        testBlock.setTransactions(new ArrayList<>());

        // Act
        String hash = proofOfWorkService.calculateHash(testBlock);

        // Assert
        assertNotNull(hash);
        assertEquals(64, hash.length());
    }


    @Test
    void mineBlock_ShouldProduceReproducibleResults() {
        // Arrange
        Block block1 = new Block();
        block1.setIndex(1L);
        block1.setPreviousHash("same_hash");
        block1.setTransactions(new ArrayList<>());
        block1.setTimestamp(12345L);

        Block block2 = new Block();
        block2.setIndex(1L);
        block2.setPreviousHash("same_hash");
        block2.setTransactions(new ArrayList<>());
        block2.setTimestamp(12345L);

        // Act
        proofOfWorkService.mineBlock(block1, 2);
        proofOfWorkService.mineBlock(block2, 2);

        // Assert
        assertEquals(block1.getHash(), block2.getHash());
        assertEquals(block1.getNonce(), block2.getNonce());
    }

    @Test
    void validateBlock_ShouldWorkForGenesisBlock() {
        // Arrange
        Block genesisBlock = new Block();
        genesisBlock.setIndex(0L);
        genesisBlock.setPreviousHash("0");
        genesisBlock.setTransactions(new ArrayList<>());
        genesisBlock.setDifficulty(2);

        proofOfWorkService.mineBlock(genesisBlock, 2);

        // Act
        boolean result = proofOfWorkService.validateBlock(genesisBlock);

        // Assert
        assertTrue(result);
    }
}

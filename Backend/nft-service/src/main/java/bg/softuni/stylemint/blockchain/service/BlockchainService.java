package bg.softuni.stylemint.blockchain.service;

import bg.softuni.stylemint.blockchain.config.BlockchainProperties;
import bg.softuni.stylemint.blockchain.model.Block;
import bg.softuni.stylemint.blockchain.model.Transaction;
import bg.softuni.stylemint.blockchain.repository.BlockRepository;
import bg.softuni.stylemint.blockchain.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BlockchainService {

    private final BlockRepository blockRepository;
    private final TransactionRepository transactionRepository;
    private final ProofOfWorkService proofOfWorkService;
    private final BlockchainProperties blockchainProperties;

    private int currentDifficulty;

    @PostConstruct
    public void init() {
        this.currentDifficulty = blockchainProperties.getDifficulty();

        if (blockRepository.count() == 0) {
            createGenesisBlock();
        }
    }

    private void createGenesisBlock() {
        Block genesisBlock = new Block();
        genesisBlock.setIndex(0L);
        genesisBlock.setPreviousHash("0");
        genesisBlock.setTransactions(new ArrayList<>());
        genesisBlock.setDifficulty(currentDifficulty);

        proofOfWorkService.mineBlock(genesisBlock, currentDifficulty);
        blockRepository.save(genesisBlock);
    }

    public Block createNewBlock(List<Transaction> transactions) {
        Optional<Block> lastBlock = blockRepository.findTopByOrderByIndexDesc();

        Block newBlock = new Block();
        newBlock.setIndex(lastBlock.map(block -> block.getIndex() + 1).orElse(0L));
        newBlock.setPreviousHash(lastBlock.map(Block::getHash).orElse("0"));
        newBlock.setTransactions(transactions);
        newBlock.setDifficulty(currentDifficulty);

        proofOfWorkService.mineBlock(newBlock, currentDifficulty);

        transactions.forEach(tx -> {
            tx.setStatus(Transaction.TransactionStatus.CONFIRMED);
            tx.setBlockHash(newBlock.getHash());
            transactionRepository.save(tx);
        });

        return blockRepository.save(newBlock);
    }

    public boolean isChainValid() {
        List<Block> blocks = blockRepository.findAllByOrderByIndexAsc();

        for (int i = 1; i < blocks.size(); i++) {
            Block currentBlock = blocks.get(i);
            Block previousBlock = blocks.get(i - 1);

            if (!currentBlock.getPreviousHash().equals(previousBlock.getHash())) {
                return false;
            }

            if (!proofOfWorkService.validateBlock(currentBlock)) {
                return false;
            }
        }

        return true;
    }
}

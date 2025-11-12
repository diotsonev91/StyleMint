// ProofOfWorkService.java
package bg.softuni.stylemint.blockchain.service;

import bg.softuni.stylemint.blockchain.model.Block;
import org.springframework.stereotype.Service;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
public class ProofOfWorkService {

    private static final Integer DEFAULT_DIFFICULTY = 4;

    public String calculateHash(Block block) {
        String data = block.getIndex() + block.getTimestamp() + block.getPreviousHash() +
                block.getNonce() + block.getTransactions().hashCode();
        return applySha256(data);
    }

    public void mineBlock(Block block, Integer difficulty) {
        String target = "0".repeat(difficulty);
        block.setNonce(0);
        block.setHash(calculateHash(block)); // ✅ initialize hash before checking

        while (!block.getHash().startsWith(target)) { // ✅ safer check
            block.setNonce(block.getNonce() + 1);
            block.setHash(calculateHash(block));
        }
    }


    public Boolean validateBlock(Block block) {
        String calculatedHash = calculateHash(block);
        return calculatedHash.equals(block.getHash());
    }

    private String applySha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes());
            StringBuilder hexString = new StringBuilder();

            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
package bg.softuni.stylemint.blockchain.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.blockchain")
public class BlockchainProperties {
    private int difficulty;
    private long miningInterval;
}

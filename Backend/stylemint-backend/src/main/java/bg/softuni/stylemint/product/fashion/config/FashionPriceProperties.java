package bg.softuni.stylemint.product.fashion.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

import java.util.Map;

/**
 * Configuration properties for fashion product pricing
 *
 * Loaded from application-prices.properties
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "fashion.prices")
@PropertySource("classpath:application-prices.properties")
public class FashionPriceProperties {

    private Map<String, Double> base;
    private Map<String, Double> modifiers;
    private Map<String, BonusTier> bonusMultipliers;

    @Data
    public static class BonusTier {
        private Integer minPoints;
        private Double multiplier;
    }

    // Convenience methods
    public Double getBasePrice(String clothType) {
        return base.getOrDefault(clothType, 29.99);
    }

    public Double getCustomDecalPremium() {
        return modifiers.getOrDefault("custom-decal-premium", 5.00);
    }

    public Double getMultiplierForPoints(Integer bonusPoints) {
        if (bonusPoints == null) return 1.0;

        return bonusMultipliers.values().stream()
                .sorted((a, b) -> Integer.compare(b.getMinPoints(), a.getMinPoints()))
                .filter(tier -> bonusPoints >= tier.getMinPoints())
                .findFirst()
                .map(BonusTier::getMultiplier)
                .orElse(1.0);
    }
}
package bg.softuni.stylemint.product.fashion.config;

import bg.softuni.stylemint.product.fashion.enums.ClothType;
import bg.softuni.stylemint.product.fashion.enums.CustomizationType;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

import java.util.Map;

/**
 * Configuration properties for fashion product pricing.
 * Loaded from application-prices.properties
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "fashion.prices")
@PropertySource("classpath:application-prices.properties")
public class FashionPriceProperties {

    private Map<String, Double> base;
    private Map<String, Double> bonus;

    public double getBasePrice(ClothType type) {
        String key = type.name().toLowerCase().replace("_", "-");
        return base.getOrDefault(key, 29.99);
    }

    public double getComplexityMultiplier(CustomizationType type) {
        return switch (type) {
            case SIMPLE -> 1.05;
            case ADVANCED -> 1.15;
        };
    }

    /**
     * totalPoints = сума бонус точки от дизайни на юзера
     */
    public double getBonusDiscount(int totalPoints) {
        return bonus.entrySet().stream()
                .filter(e -> totalPoints >= Integer.parseInt(e.getKey()))
                .sorted((a, b) -> Integer.compare(
                        Integer.parseInt(b.getKey()),
                        Integer.parseInt(a.getKey()))
                )
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(0.0);
    }
}


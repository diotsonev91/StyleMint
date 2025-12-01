// CacheConfig.java
package bg.softuni.stylemint.external.config;

import bg.softuni.dtos.nft.UserNftsResponse;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfig {

    @Bean
    public Cache<UUID, UserNftsResponse> userNftsCache() {
        return Caffeine.newBuilder()
                .maximumSize(10_000)
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .recordStats() // За мониторинг
                .build();
    }

    @Bean
    public Cache<UUID, byte[]> certificateCache() {
        return Caffeine.newBuilder()
                .maximumSize(1_000)
                .expireAfterWrite(1, TimeUnit.HOURS)
                .recordStats()
                .build();
    }
}
package bg.softuni.stylemint.orderservice.config;

import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaAdmin;

import java.util.HashMap;
import java.util.Map;

@Configuration  // ← Use @Configuration instead of @Component
public class KafkaTopicConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public KafkaAdmin kafkaAdmin() {
        Map<String, Object> configs = new HashMap<>();
        configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        return new KafkaAdmin(configs);
    }

    @Bean
    public NewTopic deliveryStartTopic() {
        return new NewTopic("delivery.start", 3, (short) 1);
    }

    @Bean
    public NewTopic deliveryRegisteredTopic() {
        return new NewTopic("delivery.registered", 3, (short) 1);
    }

    @Bean
    public NewTopic deliveryCompletedTopic() {
        return new NewTopic("delivery.completed", 3, (short) 1);
    }
}
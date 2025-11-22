package bg.softuni.stylemint;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableFeignClients(basePackages = "bg.softuni.stylemint.external.client")
@EnableScheduling
public class StyleMintBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(StyleMintBackendApplication.class, args);
	}

}

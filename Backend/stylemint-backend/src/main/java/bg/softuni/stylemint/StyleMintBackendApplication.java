package bg.softuni.stylemint;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients(basePackages = "bg.softuni.stylemint.external.client")
public class StyleMintBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(StyleMintBackendApplication.class, args);
	}

}

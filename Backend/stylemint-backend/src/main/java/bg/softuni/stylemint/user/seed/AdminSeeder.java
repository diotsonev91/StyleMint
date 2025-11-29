package bg.softuni.stylemint.user.seed;

import bg.softuni.stylemint.user.enums.UserRole;
import bg.softuni.stylemint.user.model.User;
import bg.softuni.stylemint.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${stylemint.admin.email}")
    private String adminEmail;

    @Value("${stylemint.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {

        boolean adminExists = userRepository.existsByRolesContainingAndDeletedFalse(UserRole.ADMIN);

        if (!adminExists) {

            User admin = User.builder()
                    .email(adminEmail)
                    .displayName("Administrator")
                    .password(passwordEncoder.encode(adminPassword))
                    .systemUser(true)
                    .roles(Set.of(UserRole.ADMIN))
                    .build();

            userRepository.save(admin);

            log.warn("✔ ROOT ADMIN CREATED → {} / {}", adminEmail, adminPassword);
        }
    }
}

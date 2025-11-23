package bg.softuni.stylemint.auth.service;

import bg.softuni.stylemint.auth.dto.*;
import bg.softuni.stylemint.auth.exception.InvalidTokenException;
import bg.softuni.stylemint.auth.util.JwtTokenProvider;
import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.enums.UserRole;
import bg.softuni.stylemint.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authManager;

    @Override
    public UserDTO register(UserRegisterRequestDTO req) {
        return userService.createUser(
                req.getEmail(),
                req.getDisplayName(),
                req.getPassword()
        );
    }

    @Override
    public String login(UserLoginRequestDTO req) {
        // Authenticate the user
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        // Fetch the user to get their ID and roles
        UserDTO user = userService.findByEmail(req.getEmail());

        // ✅ Extract roles from user (adjust according to your UserDTO structure)
        List<String> roles = extractUserRoles(user);

        // Generate token with user ID, email, and roles
        return jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), roles);
    }

    @Override
    public String refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new InvalidTokenException("Invalid refresh token");
        }

        // Extract user ID, email, and roles from the refresh token
        UUID userId = jwtTokenProvider.extractUserId(refreshToken);
        String email = jwtTokenProvider.extractEmail(refreshToken);
        List<String> roles = jwtTokenProvider.extractRoles(refreshToken);

        // Generate new access token with the same roles
        return jwtTokenProvider.generateAccessToken(userId, email, roles);
    }

    /**
     * Извлича roles от UserDTO
     */
    private List<String> extractUserRoles(UserDTO user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            // Fallback to default role if no roles assigned
            return List.of(UserRole.CUSTOMER.toString());
        }

        // Convert UserRole enum to String list
        return user.getRoles().stream()
                .map(Enum::name)  // UserRole.ADMIN -> "ADMIN"
                .toList();
    }
}
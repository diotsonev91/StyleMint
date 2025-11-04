package bg.softuni.stylemint.auth.service;

import bg.softuni.stylemint.auth.dto.*;
import bg.softuni.stylemint.auth.exception.InvalidTokenException;
import bg.softuni.stylemint.auth.util.JwtTokenProvider;
import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.model.User;
import bg.softuni.stylemint.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

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

        // Fetch the user to get their ID
        UserDTO user = userService.findByEmail(req.getEmail());

        // Generate token with user ID and email
        return jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
    }

    @Override
    public String refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new InvalidTokenException("Invalid refresh token");
        }

        // Extract user ID and email from the refresh token
        UUID userId = jwtTokenProvider.extractUserId(refreshToken);
        String email = jwtTokenProvider.extractEmail(refreshToken);

        // Generate new access token
        return jwtTokenProvider.generateAccessToken(userId, email);
    }

}
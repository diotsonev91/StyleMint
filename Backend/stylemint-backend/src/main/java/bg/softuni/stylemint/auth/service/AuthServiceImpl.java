package bg.softuni.stylemint.auth.service;

import bg.softuni.stylemint.auth.dto.*;
import bg.softuni.stylemint.auth.exception.InvalidTokenException;
import bg.softuni.stylemint.auth.exception.MissingTokenException;
import bg.softuni.stylemint.auth.util.JwtTokenProvider;
import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.enums.UserRole;
import bg.softuni.stylemint.user.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Arrays;
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
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        UserDTO user = userService.findByEmail(req.getEmail());

        List<String> roles = extractUserRoles(user);

        return jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), roles);
    }

    @Override
    public String refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new InvalidTokenException("Invalid refresh token");
        }

        UUID userId = jwtTokenProvider.extractUserId(refreshToken);
        String email = jwtTokenProvider.extractEmail(refreshToken);
        List<String> roles = jwtTokenProvider.extractRoles(refreshToken);

        return jwtTokenProvider.generateAccessToken(userId, email, roles);
    }

    @Override
    public List<String> extractUserRoles(UserDTO user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return List.of(UserRole.CUSTOMER.toString());
        }

        return user.getRoles().stream()
                .map(Enum::name)
                .toList();
    }

    @Override
    public String extractRefreshToken(HttpServletRequest request) {

        if (request.getCookies() == null) {
            throw new MissingTokenException("Refresh token not found");
        }

        return Arrays.stream(request.getCookies())
                .filter(c -> "SM_REFRESH".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElseThrow(() -> new MissingTokenException("Refresh token not found"));
    }

}
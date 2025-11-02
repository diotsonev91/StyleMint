package bg.softuni.stylemint.auth.service;

import bg.softuni.stylemint.auth.dto.*;
import bg.softuni.stylemint.auth.exception.InvalidTokenException;
import bg.softuni.stylemint.auth.util.JwtTokenProvider;
import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;


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
        return jwtTokenProvider.generateAccessToken(req.getEmail());
    }

    @Override
    public String refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new InvalidTokenException("Invalid refresh token");
        }

        String email = jwtTokenProvider.extractUsername(refreshToken);
        return jwtTokenProvider.generateAccessToken(email);
    }
}

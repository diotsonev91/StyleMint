package bg.softuni.stylemint.auth.web;

import bg.softuni.stylemint.auth.dto.*;
import bg.softuni.stylemint.auth.exception.MissingTokenException;
import bg.softuni.stylemint.auth.service.AuthService;
import bg.softuni.stylemint.auth.util.JwtTokenProvider;
import bg.softuni.stylemint.user.dto.UserDTO;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@Valid @RequestBody UserRegisterRequestDTO dto) {
        return ResponseEntity.ok(authService.register(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody UserLoginRequestDTO dto,
                                                 HttpServletResponse response) {
        String accessToken = authService.login(dto);
        String refreshToken = jwtTokenProvider.generateRefreshToken(dto.getEmail());

        ResponseCookie access = ResponseCookie.from("SM_ACCESS", accessToken)
                .httpOnly(true)
                .secure(false) // TODO: Set to true in production
                .path("/")
                .maxAge(jwtTokenProvider.getAccessExpirationMs() / 1000)
                .sameSite("Lax")
                .build();

        ResponseCookie refresh = ResponseCookie.from("SM_REFRESH", refreshToken)
                .httpOnly(true)
                .secure(false) // TODO: Set to true in production
                .path("/auth/refresh")
                .maxAge(jwtTokenProvider.getRefreshExpirationMs() / 1000)
                .sameSite("Strict")
                .build();

        response.addHeader("Set-Cookie", access.toString());
        response.addHeader("Set-Cookie", refresh.toString());

        return ResponseEntity.ok(new AuthResponseDTO("Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractRefreshToken(request);

        String newAccessToken = authService.refresh(refreshToken);

        ResponseCookie newAccess = ResponseCookie.from("SM_ACCESS", newAccessToken)
                .httpOnly(true)
                .secure(false) // TODO: Set to true in production
                .path("/")
                .maxAge(jwtTokenProvider.getAccessExpirationMs() / 1000)
                .sameSite("Lax")
                .build();

        response.addHeader("Set-Cookie", newAccess.toString());

        return ResponseEntity.ok(new AuthResponseDTO("Access token refreshed"));
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponseDTO> logout(HttpServletResponse response) {
        // Clear both access and refresh cookies by setting maxAge=0
        ResponseCookie clearAccess = ResponseCookie.from("SM_ACCESS", "")
                .httpOnly(true)
                .secure(false) // TODO: Set to true in production
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        ResponseCookie clearRefresh = ResponseCookie.from("SM_REFRESH", "")
                .httpOnly(true)
                .secure(false) // TODO: Set to true in production
                .path("/auth/refresh")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        response.addHeader("Set-Cookie", clearAccess.toString());
        response.addHeader("Set-Cookie", clearRefresh.toString());

        return ResponseEntity.ok(new AuthResponseDTO("Logged out successfully"));
    }

    /**
     * Extracts refresh token from cookies
     * @throws MissingTokenException if refresh token is not found
     */
    private String extractRefreshToken(HttpServletRequest request) {
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
package bg.softuni.stylemint.auth.web;

import bg.softuni.stylemint.auth.dto.*;
import bg.softuni.stylemint.auth.exception.MissingTokenException;
import bg.softuni.stylemint.auth.security.JwtUserDetails;
import bg.softuni.stylemint.auth.service.AuthService;
import bg.softuni.stylemint.auth.util.JwtTokenProvider;
import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.*;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@RestController
@RequestMapping(BASE + "/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@Valid @RequestBody UserRegisterRequestDTO dto) {
        return ResponseEntity.ok(authService.register(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody UserLoginRequestDTO dto,
                                                 HttpServletRequest request,
                                                 HttpServletResponse response) {
        String accessToken = authService.login(dto);
        UserDTO user = userService.findByEmail(dto.getEmail());

        List<String> roles = authService.extractUserRoles(user);

        // Generate refresh token with roles
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail(), roles);

        ResponseCookie access = ResponseCookie.from("SM_ACCESS", accessToken)
                .httpOnly(true)
                .secure(false) // TODO: Set to true in production
                .path("/")
                .maxAge(jwtTokenProvider.getAccessExpirationMs() / 1000)
                .domain("localhost")
                .sameSite("Lax")
                .build();

        ResponseCookie refresh = ResponseCookie.from("SM_REFRESH", refreshToken)
                .httpOnly(true)
                .secure(false) // TODO: Set to true in production
                .path("/")
                .maxAge(jwtTokenProvider.getRefreshExpirationMs() / 1000)
                .domain("localhost")
                .sameSite("Lax")
                .build();

        response.addHeader("Set-Cookie", access.toString());
        response.addHeader("Set-Cookie", refresh.toString());

        return ResponseEntity.ok(new AuthResponseDTO("Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {

        String refreshToken = authService.extractRefreshToken(request);
        String newAccessToken = authService.refresh(refreshToken);

        ResponseCookie newAccess = ResponseCookie.from("SM_ACCESS", newAccessToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(jwtTokenProvider.getAccessExpirationMs() / 1000)
                .domain("localhost")
                .sameSite("Lax")
                .build();

        response.addHeader("Set-Cookie", newAccess.toString());

        return ResponseEntity.ok(new AuthResponseDTO("Access token refreshed"));
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("csrfToken", token.getToken());
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponseDTO> logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        // Create deletion cookies
        ResponseCookie clearAccess = ResponseCookie.from("SM_ACCESS", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .domain("localhost")
                .sameSite("Lax")
                .build();

        ResponseCookie clearRefresh = ResponseCookie.from("SM_REFRESH", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .domain("localhost")
                .sameSite("Lax")
                .build();

        // Set headers
        response.setHeader("Set-Cookie", clearAccess.toString());
        response.addHeader("Set-Cookie", clearRefresh.toString());

        return ResponseEntity.ok(new AuthResponseDTO("Logged out successfully"));
    }

    /**
     * Get current authenticated user
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(
            @AuthenticationPrincipal JwtUserDetails userDetails) {

        // ✅ Директно достъпваш userId от userDetails
        UserDTO user = userService.findById(userDetails.getUserId());

        return ResponseEntity.ok(user);
    }
}
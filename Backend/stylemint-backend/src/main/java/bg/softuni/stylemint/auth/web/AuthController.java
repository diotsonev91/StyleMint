package bg.softuni.stylemint.auth.web;

import bg.softuni.stylemint.auth.dto.*;
import bg.softuni.stylemint.auth.exception.MissingTokenException;
import bg.softuni.stylemint.auth.security.CustomUserDetails;
import bg.softuni.stylemint.auth.service.AuthService;
import bg.softuni.stylemint.auth.util.JwtTokenProvider;
import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.model.User;
import bg.softuni.stylemint.user.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

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
                                                 HttpServletResponse response) {
        String accessToken = authService.login(dto);
        UserDTO user = userService.findByEmail(dto.getEmail());

        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());

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
    public ResponseEntity<AuthResponseDTO> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractRefreshToken(request);

        String newAccessToken = authService.refresh(refreshToken);

        ResponseCookie newAccess = ResponseCookie.from("SM_ACCESS", newAccessToken)
                .httpOnly(true)
                .secure(false) // TODO: Set to true in production
                .path("/")
                .maxAge(jwtTokenProvider.getAccessExpirationMs() / 1000)
                .domain("localhost")
                .sameSite("Lax")
                .build();

        response.addHeader("Set-Cookie", newAccess.toString());

        return ResponseEntity.ok(new AuthResponseDTO("Access token refreshed"));
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponseDTO> logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        System.out.println("\n🚪 ==================== LOGOUT DEBUG ====================");

        // Log incoming cookies
        System.out.println("📥 INCOMING COOKIES:");
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                System.out.println(String.format("   %s: value='%s...', domain='%s', path='%s'",
                        cookie.getName(),
                        cookie.getValue().length() > 20 ? cookie.getValue().substring(0, 20) : cookie.getValue(),
                        cookie.getDomain(),
                        cookie.getPath()));
            }
        } else {
            System.out.println("   NO COOKIES!");
        }

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

        // Log outgoing headers
        System.out.println("\n📤 OUTGOING Set-Cookie HEADERS:");
        System.out.println("   ACCESS:  " + clearAccess.toString());
        System.out.println("   REFRESH: " + clearRefresh.toString());

        // Set headers
        response.setHeader("Set-Cookie", clearAccess.toString());
        response.addHeader("Set-Cookie", clearRefresh.toString());

        System.out.println("==================== LOGOUT DEBUG END ====================\n");

        return ResponseEntity.ok(new AuthResponseDTO("Logged out successfully"));
    }

    /**
     * Get current authenticated user
     * This endpoint is used by the frontend to check authentication status
     * and retrieve user information after login
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        // Use existing UserService to get the full UserDTO
        return ResponseEntity.ok(userService.findByEmail(user.getEmail()));
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
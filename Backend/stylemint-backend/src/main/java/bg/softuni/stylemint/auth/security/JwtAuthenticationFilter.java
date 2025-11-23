package bg.softuni.stylemint.auth.security;

import bg.softuni.stylemint.auth.util.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Определя кои endpoints да се skip-нат от JWT authentication
     */
    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getRequestURI();

        // Skip JWT validation за authentication endpoints
        return path.equals(BASE + "/auth/login") ||
                path.equals(BASE + "/auth/register") ||
                path.equals(BASE + "/auth/refresh") ||
                path.equals(BASE + "/auth/logout");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain
    ) throws ServletException, IOException {

        try {
            // 1. Extract JWT token
            String token = extractToken(request);

            // 2. Validate and authenticate
            if (token != null && jwtTokenProvider.validateToken(token)) {
                authenticateUser(token, request);
            }

        } catch (Exception ex) {
            log.error("Cannot set user authentication: {}", ex.getMessage());
        }

        // 3. Continue filter chain
        chain.doFilter(request, response);
    }

    /**
     * Извлича JWT token от request (cookie или Authorization header)
     */
    private String extractToken(HttpServletRequest request) {
        // 1. Try from Authorization header first
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // 2. Try from cookie
        if (request.getCookies() != null) {
            return Arrays.stream(request.getCookies())
                    .filter(cookie -> "SM_ACCESS".equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }

        return null;
    }

    /**
     * Създава и set-ва authentication в SecurityContext
     */
    private void authenticateUser(String token, HttpServletRequest request) {
        // Extract user info from token
        UUID userId = jwtTokenProvider.extractUserId(token);
        String email = jwtTokenProvider.extractEmail(token);
        List<String> roles = jwtTokenProvider.extractRoles(token);

        // Convert roles to Spring Security authorities
        List<org.springframework.security.core.GrantedAuthority> authorities =
                roles.stream()
                        .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role))
                        .collect(java.util.stream.Collectors.toList());

        // Create authentication token
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userId.toString(),  // Principal (user ID)
                        null,              // Credentials (не ни трябват след validation)
                        authorities        // ✅ Authorities от roles
                );

        // Set request details
        authentication.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request)
        );

        // Set authentication in SecurityContext
        SecurityContextHolder.getContext().setAuthentication(authentication);

        log.debug("User authenticated: userId={}, email={}, roles={}", userId, email, roles);
    }
}
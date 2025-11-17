package bg.softuni.stylemint.auth.security;

import bg.softuni.stylemint.auth.util.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        System.out.println("\n🎯 JWT FILTER CALLED: " + uri);

        if (uri.equals("/api/v1/auth/refresh")) {
            System.out.println("⏭️  Skipping refresh endpoint");
            chain.doFilter(request, response);
            return;
        }

        String token = extractToken(request);
        System.out.println("🎫 Token extracted: " + (token != null ? "YES" : "NO"));

        if (token != null) {
            boolean isValid = jwtTokenProvider.validateToken(token);
            System.out.println("✅ Token valid: " + isValid);

            if (isValid) {
                try {
                    String email = jwtTokenProvider.extractEmail(token);
                    System.out.println("📧 Email from token: " + email);

                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    System.out.println("👤 User loaded: " + userDetails.getUsername());

                    var auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );

                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);

                    System.out.println("🔐 ✅ AUTHENTICATION SET SUCCESSFULLY!");
                    System.out.println("Authorities: " + userDetails.getAuthorities());

                } catch (Exception e) {
                    System.out.println("❌ ERROR setting authentication: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("❌ Token is INVALID!");
            }
        } else {
            System.out.println("❌ No token found!");
        }

        chain.doFilter(request, response);
    }


    private String extractToken(HttpServletRequest request) {
        System.out.println("\n🔍 ========== EXTRACTING TOKEN ==========");

        // 1. Try from Authorization header
        String authHeader = request.getHeader("Authorization");
        System.out.println("Authorization header: " + authHeader);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            System.out.println("✅ Found Bearer token in header");
            return authHeader.substring(7);
        }

        // 2. Try from cookie
        if (request.getCookies() != null) {
            System.out.println("🍪 Total cookies: " + request.getCookies().length);

            for (Cookie cookie : request.getCookies()) {
                System.out.println("  Cookie: " + cookie.getName() + " = " +
                        (cookie.getValue().length() > 30 ?
                                cookie.getValue().substring(0, 30) + "..." :
                                cookie.getValue()));
            }

            String token = Arrays.stream(request.getCookies())
                    .filter(c -> "SM_ACCESS".equals(c.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);

            if (token != null) {
                System.out.println("✅ Found SM_ACCESS cookie!");
                System.out.println("Token length: " + token.length());
                System.out.println("Token starts with: " + token.substring(0, Math.min(50, token.length())));
                return token;
            } else {
                System.out.println("❌ SM_ACCESS cookie NOT FOUND!");
            }
        } else {
            System.out.println("❌ NO COOKIES AT ALL!");
        }

        System.out.println("========================================\n");
        return null;
    }
}

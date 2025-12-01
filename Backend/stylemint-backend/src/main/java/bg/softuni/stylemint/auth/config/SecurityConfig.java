package bg.softuni.stylemint.auth.config;

import bg.softuni.stylemint.auth.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import static bg.softuni.stylemint.config.ApiPaths.BASE;

/**
 * Security Configuration for JWT-based authentication
 *
 * ⚠️ IMPORTANT: Understanding UserDetailsService usage
 *
 * Login Flow (USES UserDetailsService):
 * 1. User sends email/password to /login
 * 2. AuthenticationManager → DaoAuthenticationProvider → UserDetailsService
 * 3. UserDetailsService loads user from database
 * 4. DaoAuthenticationProvider validates password
 * 5. JWT token is generated and returned
 *
 * Regular Request Flow (DOES NOT use UserDetailsService):
 * 1. User sends JWT token in HttpOnly cookie
 * 2. JwtAuthenticationFilter validates token
 * 3. Authentication is set from JWT claims (NO database query)
 * 4. Request proceeds to controller
 *
 * Summary:
 * - UserDetailsService is ONLY used for /login endpoint
 * - All other endpoints use JWT validation (no UserDetailsService)
 * - This is the standard Spring Security + JWT pattern
 *
 * ⚠️ CSRF Protection Status: DISABLED
 *
 * CSRF is currently disabled for the following reasons:
 * 1. Development Environment: Frontend (localhost:5173) and Backend (localhost:8080)
 *    are on different ports, causing cross-origin cookie issues
 * 2. HttpOnly Cookies: JWT tokens are already in HttpOnly cookies which provides
 *    protection against XSS attacks
 * 3. CORS Configuration: Strict CORS policy limits requests to known origins
 *
 * For Production Deployment:
 * - Enable CSRF protection if frontend and backend are on different domains
 * - Use SameSite=Strict cookies
 * - Implement proper CSRF token handling in frontend
 * - Consider using a reverse proxy to serve both frontend and backend from same origin
 */
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                // CSRF is disabled for development with separate frontend/backend ports
                // See class-level documentation for details
                .csrf(AbstractHttpConfigurer::disable)

                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // ✅ Public endpoints (no authentication)
                        .requestMatchers(
                                BASE + "/auth/register",
                                BASE + "/auth/login",
                                BASE + "/auth/refresh",
                                BASE + "/orders/payment-success",
                                BASE + "/auth/logout",

                                // 🎵 PUBLIC SOUND PACK ENDPOINTS
                                BASE + "/audio/packs/latest",
                                BASE + "/audio/packs/top-rated",
                                BASE + "/audio/packs/most-downloaded",

                                // 👕 PUBLIC DESIGN ENDPOINTS
                                BASE + "/designs/top-liked",
                                BASE + "/designs/latest",
                                BASE + "/designs/likes-count"
                        ).permitAll()

                        // ✅ Authenticated endpoints
                        .requestMatchers(BASE + "/auth/me").authenticated()

                        // ✅ All other endpoints require authentication
                        .anyRequest().authenticated()
                )

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Unauthorized\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Forbidden - Insufficient permissions\"}");
                        })
                )

                // ✅ JWT filter runs before Spring Security's default authentication
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /**
     * Authentication Provider for login with email/password
     *
     * This is ONLY used for the /login endpoint to:
     * 1. Load user from database via UserDetailsService
     * 2. Validate password with BCryptPasswordEncoder
     *
     * After login, JWT tokens are used and this provider is NOT invoked.
     *
     * Note: Spring Security automatically uses this provider when AuthenticationManager
     * is called in AuthServiceImpl.login()
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * AuthenticationManager is used ONLY in AuthServiceImpl.login()
     * to authenticate user credentials before generating JWT token
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
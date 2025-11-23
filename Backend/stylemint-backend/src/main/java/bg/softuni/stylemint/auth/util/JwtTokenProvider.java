package bg.softuni.stylemint.auth.util;

import bg.softuni.stylemint.auth.exception.InvalidTokenException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Getter
    @Value("${jwt.access.expiration:900000}") // 15 min
    private long accessExpirationMs;

    @Getter
    @Value("${jwt.refresh.expiration:604800000}") // 7 days
    private long refreshExpirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generate access token with roles
     */
    public String generateAccessToken(UUID userId, String email, List<String> roles) {
        return buildToken(userId, email, roles, accessExpirationMs);
    }

    /**
     * Generate refresh token with roles
     */
    public String generateRefreshToken(UUID userId, String email, List<String> roles) {
        return buildToken(userId, email, roles, refreshExpirationMs);
    }

    /**
     * Build JWT token with user info and roles
     */
    private String buildToken(UUID userId, String email, List<String> roles, long validityMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + validityMs);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim("roles", roles)  // ✅ Добавяме roles в token
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extract user ID from token
     */
    public UUID extractUserId(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    /**
     * Extract email from token
     */
    public String extractEmail(String token) {
        return parseClaims(token).get("email", String.class);
    }

    /**
     * Extract roles from token
     */
    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        return parseClaims(token).get("roles", List.class);
    }

    /**
     * Validate token
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException ex) {
            return false;
        } catch (JwtException ex) {
            return false;
        } catch (Exception ex) {
            return false;
        }
    }

    /**
     * Parse JWT claims
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
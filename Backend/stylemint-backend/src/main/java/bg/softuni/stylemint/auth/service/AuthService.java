package bg.softuni.stylemint.auth.service;

import bg.softuni.stylemint.auth.dto.UserLoginRequestDTO;
import bg.softuni.stylemint.auth.dto.UserRegisterRequestDTO;
import bg.softuni.stylemint.user.dto.UserDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.List;
import java.util.UUID;

public interface AuthService {
    UserDTO register(UserRegisterRequestDTO request);
    String login(UserLoginRequestDTO request);
    String refresh(String refreshToken);
    String extractRefreshToken(HttpServletRequest request);
    List<String> extractUserRoles(UserDTO user);
    void logout(HttpServletResponse response);
    void logoutUser(UUID userId, HttpServletResponse response);
    void clearAuthCookies(HttpServletResponse response);
}

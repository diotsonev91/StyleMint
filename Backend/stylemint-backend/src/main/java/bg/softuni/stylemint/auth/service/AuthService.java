package bg.softuni.stylemint.auth.service;

import bg.softuni.stylemint.auth.dto.UserLoginRequestDTO;
import bg.softuni.stylemint.auth.dto.UserRegisterRequestDTO;
import bg.softuni.stylemint.user.dto.UserDTO;

import java.util.UUID;

public interface AuthService {
    UserDTO register(UserRegisterRequestDTO request);
    String login(UserLoginRequestDTO request);
    String refresh(String refreshToken);

}

package bg.softuni.stylemint.user.service;

import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.model.User;

import java.util.List;
import java.util.UUID;

public interface UserService {

    UserDTO findById(UUID id);

    UserDTO findByEmail(String email);

    UserDTO createUser(String email, String displayName, String rawPassword);

    UserDTO updateUser(UUID id, User user);

    void deleteUser(UUID id, UUID currentUserId);

    List<UserDTO> searchUsers(String query);

    User getUserById(UUID userId);

    void adminDeleteUser(UUID targetUserId);
}

// UserMapper.java
package bg.softuni.stylemint.user.service.util;

import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.model.User;

import java.util.HashSet;

public final class UserMapper {

    private UserMapper() {}

    public static UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .roles(user.getRoles() != null ? new HashSet<>(user.getRoles()) : new HashSet<>())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}

package bg.softuni.stylemint.user.service.util;

import bg.softuni.stylemint.user.dto.UserDTO;
import bg.softuni.stylemint.user.model.User;

public final class UserMapper {

    private UserMapper() {}

    public static UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}

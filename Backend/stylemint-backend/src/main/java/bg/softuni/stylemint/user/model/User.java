package bg.softuni.stylemint.user.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Role role;


    @Column(nullable = false, unique = true, length = 128)
    private String email;

    @Column(nullable = false)
    private String password; // BCRYPT-нат после

    @Column(name = "display_name", length = 64)
    private String displayName; // използваш като "artist" видимо

    @Column(name = "avatar_url")
    private String avatarUrl;

    @CreationTimestamp
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;
}

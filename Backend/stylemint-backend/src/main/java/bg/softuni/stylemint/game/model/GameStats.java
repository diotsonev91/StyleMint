package bg.softuni.stylemint.game.model;

import bg.softuni.stylemint.game.enums.RewardType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "game_stats")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class GameStats {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     *  Участник в играта
     */
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    /**
     * Общо натрупани точки от игри
     */
    @Column(nullable = false)
    private Integer score = 0;

    /**
     * Колко игри са изиграни общо
     */
    @Column(name = "games_played", nullable = false)
    private Integer gamesPlayed = 0;

    /**
     * Кога последно е играл
     */
    @Column(name = "last_played_at")
    private OffsetDateTime lastPlayedAt;

    /**
     * Награда генерирана от игра (ако има)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "reward_type", length = 32)
    private RewardType rewardType; // null ако няма активна награда

    /**
     * Дали наградата е взета/използвана вече
     */
    @Column(name = "reward_claimed")
    private Boolean rewardClaimed = false;

    @CreationTimestamp
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;
}

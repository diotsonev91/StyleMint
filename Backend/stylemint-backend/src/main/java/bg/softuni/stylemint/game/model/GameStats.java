package bg.softuni.stylemint.game.model;

import bg.softuni.stylemint.game.enums.RewardType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Aggregate statistics for a user's game activity
 * One record per user - updated after each game
 */
@Entity
@Table(name = "game_stats")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class GameStats {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Player (unique - one record per user)
     */
    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    /**
     * Total accumulated points from all games
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer score = 0;

    /**
     * Total number of games played
     */
    @Column(name = "games_played", nullable = false)
    @Builder.Default
    private Integer gamesPlayed = 0;

    /**
     * When the user last played a game
     */
    @Column(name = "last_played_at")
    private OffsetDateTime lastPlayedAt;

    /**
     * Latest reward generated from a game (if any)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "reward_type", length = 32)
    private RewardType rewardType;

    /**
     * Whether the latest reward has been claimed/used
     */
    @Column(name = "reward_claimed")
    @Builder.Default
    private Boolean rewardClaimed = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
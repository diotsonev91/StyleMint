package bg.softuni.stylemint.game.model;

import bg.softuni.stylemint.game.enums.GameType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Leaderboard entry for each game type
 * Denormalized table for fast leaderboard queries
 */
@Entity
@Table(name = "leaderboard",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "game_type"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Leaderboard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Player
     */
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    /**
     * Game type (null = overall leaderboard)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "game_type", length = 50)
    private GameType gameType;

    /**
     * Total score for this game type (or overall if gameType is null)
     */
    @Column(name = "total_score", nullable = false)
    private Integer totalScore = 0;

    /**
     * Number of games played for this type
     */
    @Column(name = "games_played", nullable = false)
    private Integer gamesPlayed = 0;

    /**
     * Current rank (updated periodically)
     */
    @Column(name = "user_rank")
    private Integer rank;

    /**
     * Last time this entry was updated
     */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
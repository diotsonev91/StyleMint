package bg.softuni.stylemint.game.model;

import bg.softuni.stylemint.game.enums.GameType;
import bg.softuni.stylemint.game.enums.RewardType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Individual game session record
 * Each time a user plays a game, a new record is created
 */
@Entity
@Table(name = "game_sessions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Player who played this game
     */
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    /**
     * Type of game played (e.g., STYLE_MATCH, COLOR_RUSH, DESIGN_QUIZ)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "game_type", nullable = false, length = 50)
    private GameType gameType;

    /**
     * Score earned in this specific game session
     */
    @Column(nullable = false)
    private Integer score = 0;

    /**
     * Duration of the game in seconds
     */
    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    /**
     * Reward earned from this game (if any)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "reward_type", length = 32)
    private RewardType rewardType;

    /**
     * Whether the reward from this session was claimed
     */
    @Column(name = "reward_claimed")
    private Boolean rewardClaimed = false;

    /**
     * When this game was played
     */
    @CreationTimestamp
    @Column(name = "played_at", nullable = false)
    private OffsetDateTime playedAt;


    /**
     * Whether the NFT reward has been minted
     * Only applicable for NFT reward types
     */
    @Column(name = "nft_minted", nullable = false)
    @Builder.Default
    private Boolean nftMinted = false;

    /**
     * The minted NFT token ID from the NFT service
     * This is the ONLY reference we need - the NFT microservice owns all other details
     */
    @Column(name = "nft_token_id")
    private UUID nftTokenId;
}
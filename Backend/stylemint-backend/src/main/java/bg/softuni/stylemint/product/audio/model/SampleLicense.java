// File: SampleLicense.java (in orchestrator)
package bg.softuni.stylemint.product.audio.model;

import bg.softuni.stylemint.user.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sample_licenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SampleLicense {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audio_sample_id", nullable = false)
    private AudioSample audioSample;

    // Only store the order item ID as reference, not the entity
    @Column(name = "order_item_id", nullable = false)
    private UUID orderItemId;

    @Column(name = "purchased_at", nullable = false)
    private OffsetDateTime purchasedAt;
}
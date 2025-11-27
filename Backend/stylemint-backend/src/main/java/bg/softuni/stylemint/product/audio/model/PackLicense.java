package bg.softuni.stylemint.product.audio.model;

import bg.softuni.stylemint.user.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pack_licenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackLicense {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "pack_id", nullable = false)
    private UUID packId;

    @Column(name = "order_item_id", nullable = false)
    private UUID orderItemId;

    @Column(nullable = false)
    private OffsetDateTime purchasedAt;

    @Builder.Default
    private boolean archived = false;

    private OffsetDateTime archivedAt;
}

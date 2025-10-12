package bg.softuni.stylemint.nft.model;

import bg.softuni.stylemint.user.model.User;
import bg.softuni.stylemint.product.fashion.model.FashionProduct;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "nfts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"user", "product"})
public class NFT {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private FashionProduct product;

    @Column(nullable = false, length = 80)
    private String nftMintAddress;

    @Column(nullable = false, length = 120)
    private String transactionSignature;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NFTStatus status = NFTStatus.MINTED;

    private LocalDateTime createdAt = LocalDateTime.now();
}

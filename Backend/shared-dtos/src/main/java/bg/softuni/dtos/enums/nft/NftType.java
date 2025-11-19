package bg.softuni.dtos.enums.nft;

public enum NftType {
    // --- NFT discount types ---
    NFT_DISCOUNT_5,    // Вечна 5% отстъпка докато държиш NFT
    NFT_DISCOUNT_7,    // Вечна 7% отстъпка докато държиш NFT

    // --- NFT author badge types ---
    AUTHOR_BADGE_DESIGNER,
    AUTHOR_BADGE_PRODUCER;

    public boolean isTransferable() {
        return this == NFT_DISCOUNT_5 || this == NFT_DISCOUNT_7;
    }

    public boolean isAuthorBadge() {
        return this == AUTHOR_BADGE_DESIGNER || this == AUTHOR_BADGE_PRODUCER;
    }

    public boolean isDiscount() {
        return this == NFT_DISCOUNT_5 || this == NFT_DISCOUNT_7;
    }

    public int getDiscountPercentage() {
        return switch (this) {
            case NFT_DISCOUNT_5 -> 5;
            case NFT_DISCOUNT_7 -> 7;
            default -> 0;
        };
    }
}
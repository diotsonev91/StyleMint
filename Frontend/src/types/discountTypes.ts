export interface ItemDiscountBreakdown {
    productId: string;
    productType: 'CLOTHES' | 'SAMPLE' | 'PACK';
    quantity: number;

    // Price progression
    basePrice: number;
    priceAfterProductDiscount: number;
    priceAfterNftDiscount: number;
    finalPrice: number;

    // Discount percentages (0.0 - 1.0)
    productSpecificDiscountPercent: number;
    nftDiscountPercent: number;
    oneTimeDiscountPercent: number;
    totalDiscountPercent: number;
}

export interface CartDiscountBreakdown {
    items: ItemDiscountBreakdown[];

    // Cart totals
    cartBasePrice: number;
    cartFinalPrice: number;
    totalSavings: number;
    totalSavingsPercent: number;
}

export interface DiscountInfo {
    basePrice: number;
    productSpecificDiscount: number;
    nftDiscount: number;
    oneTimeDiscount: number;
    finalPrice: number;
    totalDiscountPercentage: number;
}
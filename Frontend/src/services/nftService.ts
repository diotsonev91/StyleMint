// nftService.ts
import { nftApi, type UserNftsResponse } from '../api/nft.api';

/**
 * NFT Service - handles NFT-related operations
 */
export const nftService = {
    /**
     * Get current user's NFTs
     */
    async getMyNfts(): Promise<UserNftsResponse> {
        const response = await nftApi.getMyNfts();
        return response.data.data;
    },

    /**
     * Download certificate PDF
     */
    async downloadCertificate(tokenId: string): Promise<void> {
        try {
            const response = await nftApi.downloadCertificate(tokenId);

            // Create blob and trigger download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `badge-certificate-${tokenId}.pdf`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log('✅ Certificate downloaded successfully');
        } catch (error: any) {
            console.error('❌ Failed to download certificate:', error);
            throw new Error(error.response?.data?.message || 'Failed to download certificate');
        }
    },

    /**
     * Preview certificate in new tab
     */
    async previewCertificate(tokenId: string): Promise<void> {
        try {
            const response = await nftApi.downloadCertificate(tokenId);

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Open in new tab
            window.open(url, '_blank');

            console.log('✅ Certificate preview opened');
        } catch (error: any) {
            console.error('❌ Failed to preview certificate:', error);
            throw new Error(error.response?.data?.message || 'Failed to preview certificate');
        }
    },

    /**
     * Transfer NFT to another user
     */
    async transferNft(tokenId: string, toUserId: string): Promise<void> {
        try {
            const response = await nftApi.transferNft(tokenId, toUserId);
            console.log('✅ NFT transferred successfully');
            return response.data.data;
        } catch (error: any) {
            console.error('❌ Failed to transfer NFT:', error);
            throw new Error(error.response?.data?.message || 'Failed to transfer NFT');
        }
    },

    /**
     * Get NFT type display name
     */
    getNftTypeDisplay(nftType: string): string {
        const typeMap: Record<string, string> = {
            'NFT_DISCOUNT_5': '🎫 5% Discount Badge',
            'NFT_DISCOUNT_7': '🎫 7% Discount Badge',
            'AUTHOR_BADGE_PRODUCER': '🎵 Producer Badge',
            'AUTHOR_BADGE_DESIGNER': '🎨 Designer Badge',
        };
        return typeMap[nftType] || nftType;
    },
};
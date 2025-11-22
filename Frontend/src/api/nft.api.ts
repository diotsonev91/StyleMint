// nft.api.ts
import API from "./config";

const NFT_BASE = "/nft";

export interface NftInfo {
    tokenId: string;
    nftType: string;
    isTransferable: boolean;
    createdAt: number;
}

export interface UserNftsResponse {
    userId: string;
    nfts: NftInfo[];
}

export interface TransferNftRequest {
    tokenId: string;
    toUserId: string;
}

export const nftApi = {
    /**
     * Get current user's NFTs
     */
    async getMyNfts() {
        return API.get(`${NFT_BASE}/my-nfts`);
    },

    /**
     * Download certificate PDF for NFT
     */
    async downloadCertificate(tokenId: string) {
        return API.get(`${NFT_BASE}/certificate/${tokenId}`, {
            responseType: 'blob',
        });
    },

    /**
     * Transfer NFT to another user
     */
    async transferNft(tokenId: string, toUserId: string) {
        return API.post(`${NFT_BASE}/transfer`, null, {
            params: { tokenId, toUserId }
        });
    },
};
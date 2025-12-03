// src/pages/Nft/NftTransferPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { nftService } from '../../services/nftService';
import { userProfileService } from '../../services/userProfileService';
import './NftTransferPage.css';

interface NftInfo {
    tokenId: string;
    nftType: string;
    isTransferable: boolean;
    createdAt: number;
    hasCertificate: boolean;
}

interface UserProfileData {
    displayName: string;
    avatarUrl?: string;
    memberSince: string;
}

const NftTransferPage = () => {
    const { targetUserId } = useParams<{ targetUserId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [targetUser, setTargetUser] = useState<UserProfileData | null>(null);
    const [userNfts, setUserNfts] = useState<NftInfo[]>([]);
    const [selectedNft, setSelectedNft] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [transferring, setTransferring] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!targetUserId || !user) {
            navigate('/');
            return;
        }

        fetchData();
    }, [targetUserId, user]);

    // В NftTransferPage.tsx - актуализирай fetchData функцията:
    const fetchData = async () => {
        try {
            setLoading(true);

            // Get target user information
            const userResponse = await userProfileService.getUserProfile(targetUserId!);
            if (userResponse.success && userResponse.data) {
                setTargetUser(userResponse.data);
            }

            // Get current user's NFTs
            try {
                const nftsResponse = await nftService.getMyNfts();
                // Filter only transferable NFTs
                const transferableNfts = nftsResponse.nfts.filter(
                    (nft: NftInfo) => nft.isTransferable
                );
                setUserNfts(transferableNfts);
            } catch (nftError: any) {
                console.error('Error loading NFTs:', nftError);

                // Покажи съобщение, че NFT service е недостъпен
                if (nftError.message?.includes('offline') || nftError.message?.includes('503')) {
                    setMessage('⚠️ NFT service is currently offline. ');
                }

                // Върни празен списък, за да не се счупи UI
                setUserNfts([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async () => {
        if (!selectedNft) {
            setMessage('Please select an NFT to transfer');
            return;
        }

        try {
            setTransferring(true);
            setMessage('');

            // ✅ CORRECT: Call with separate parameters
            await nftService.transferNft(selectedNft, targetUserId!);

            setMessage(`✅ NFT successfully transferred to ${targetUser?.displayName}!`);

            // Reload NFTs after successful transfer
            setTimeout(() => {
                navigate('/my-nfts');
            }, 2000);
        } catch (error: any) {
            setMessage(`❌ Error: ${error.message || 'Failed to transfer NFT'}`);
        } finally {
            setTransferring(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!targetUser) {
        return <div className="error">User not found</div>;
    }

    return (
        <div className="nft-transfer-page">
            <div className="transfer-header">
                <h1>🎁 Send NFT Gift</h1>
                <p>Send NFT to {targetUser.displayName}</p>
            </div>

            <div className="transfer-container">
                <div className="user-info-card">
                    <img
                        src={targetUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUserId}`}
                        alt={targetUser.displayName}
                        className="target-user-avatar"
                    />
                    <div className="user-info">
                        <h3>{targetUser.displayName}</h3>
                        <p>Member since {userProfileService.formatDate(targetUser.memberSince)}</p>
                    </div>
                </div>

                <div className="nft-selection">
                    <h3>Select NFT to send:</h3>

                    {userNfts.length === 0 ? (
                        <div className="no-nfts">
                            <p>🎭 You don't have any transferable NFTs</p>
                            <button
                                className="btn-primary"
                                onClick={() => navigate('/nft/my-nfts')}
                            >
                                View Your NFTs
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="nft-grid">
                                {userNfts.map((nft) => (
                                    <div
                                        key={nft.tokenId}
                                        className={`nft-card ${selectedNft === nft.tokenId ? 'selected' : ''}`}
                                        onClick={() => setSelectedNft(nft.tokenId)}
                                    >
                                        <div className="nft-type-icon">
                                            {nft.nftType === 'AUTHOR_BADGE_DESIGNER' ? '👕' :
                                                nft.nftType === 'AUTHOR_BADGE_PRODUCER' ? '🎵' : '🖼️'}
                                        </div>
                                        <div className="nft-info">
                                            <h4>{nftService.getNftTypeDisplay(nft.nftType)}</h4>
                                            <small>ID: {nft.tokenId.substring(0, 8)}...</small>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="transfer-actions">
                                <button
                                    className="btn-transfer"
                                    onClick={handleTransfer}
                                    disabled={!selectedNft || transferring}
                                >
                                    {transferring ? 'Transferring...' : '🎁 Send NFT'}
                                </button>
                                <button
                                    className="btn-cancel"
                                    onClick={() => navigate(-1)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {message && (
                    <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NftTransferPage;
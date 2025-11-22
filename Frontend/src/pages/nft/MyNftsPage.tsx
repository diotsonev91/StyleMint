// MyNftsPage.tsx
import { useEffect, useState } from 'react';
import { nftService } from '../../services/nftService';
import type { NftInfo } from '../../api/nft.api';
import './MyNftsPage.css';

export function MyNftsPage() {
    const [nfts, setNfts] = useState<NftInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadNfts();
    }, []);

    const loadNfts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await nftService.getMyNfts();
            setNfts(response.nfts);
        } catch (err) {
            console.error('Failed to load NFTs:', err);
            setError('Failed to load NFTs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (tokenId: string) => {
        const nft = nfts.find(n => n.tokenId === tokenId);
        if (nft?.hasCertificate) {
            try {
                await nftService.downloadCertificate(tokenId);
                alert('✅ Certificate downloaded successfully!');
            } catch (err) {
                alert('❌ Failed to download certificate. Please try again.');
            }
        } else {
            alert('❌ This NFT does not have a certificate available.');
        }
    };

    const handlePreview = async (tokenId: string) => {
        const nft = nfts.find(n => n.tokenId === tokenId);
        if (nft?.hasCertificate) {
            try {
                await nftService.previewCertificate(tokenId);
            } catch (err) {
                alert('❌ Failed to preview certificate. Please try again.');
            }
        } else {
            alert('❌ This NFT does not have a certificate available.');
        }
    };

    if (loading) {
        return (
            <div className="nfts-page-nft">
                <div className="loading-container-nft">
                    <div className="spinner-nft"></div>
                    <p>Loading your NFT badges...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="nfts-page-nft">
                <div className="error-container-nft">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={loadNfts} className="btn-retry-nft">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="nfts-page-nft">
            <div className="page-header-nft">
                <h1 className="page-title-nft">My NFT Badges</h1>
                <p className="page-subtitle-nft">
                    Your earned NFT badges and certificates
                </p>
            </div>

            {nfts.length === 0 ? (
                <div className="empty-state-nft">
                    <div className="empty-icon-nft">🎮</div>
                    <h2>No NFT badges yet</h2>
                    <p>Play games and earn rewards to get your first NFT badge!</p>
                </div>
            ) : (
                <div className="nfts-grid-nft">
                    {nfts.map((nft) => (
                        <div key={nft.tokenId} className="nft-card-nft">
                            <div className="nft-header-nft">
                                <h3 className="nft-title-nft">
                                    {nftService.getNftTypeDisplay(nft.nftType)}
                                </h3>
                                {nft.isTransferable && (
                                    <span className="transferable-badge-nft">
                                        Transferable
                                    </span>
                                )}
                            </div>

                            <div className="nft-info-nft">
                                <div className="info-row-nft">
                                    <span className="info-label-nft">Token ID:</span>
                                    <code className="token-id-nft">
                                        {nft.tokenId.substring(0, 8)}...
                                    </code>
                                </div>
                                <div className="info-row-nft">
                                    <span className="info-label-nft">Earned:</span>
                                    <span className="info-value-nft">
                                        {new Date(nft.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="nft-actions-nft">
                                {nft.hasCertificate && (
                                    <>
                                        <button
                                            className="btn-primary-nft"
                                            onClick={() => handlePreview(nft.tokenId)}
                                            title="Preview certificate in new tab"
                                        >
                                            👁️ Preview
                                        </button>
                                        <button
                                            className="btn-secondary-nft"
                                            onClick={() => handleDownload(nft.tokenId)}
                                            title="Download certificate PDF"
                                        >
                                            📥 Download
                                        </button>
                                    </>
                                )}
                                {!nft.hasCertificate && (
                                    <p className="no-certificate-message-nft">
                                        No certificate available
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
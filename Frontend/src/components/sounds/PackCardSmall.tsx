// src/components/PackCardSmall.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaDownload } from 'react-icons/fa';
import './PackCardSmall.css';

interface PackCardSmallProps {
    pack: {
        id: string;
        title: string;
        artist: string;
        coverImage: string;
        price: number;
        sampleCount: number;
        rating?: number;
        downloads?: number;
        genres: string[];
    };
    isLoggedIn: boolean;
}

const PackCardSmall: React.FC<PackCardSmallProps> = ({ pack, isLoggedIn }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (isLoggedIn) {
            navigate(`/pack/${pack.id}`);
        }
    };

    const formatDownloads = (count: number): string => {
        if (count < 1000) return count.toString();
        if (count < 1000000) return `${(count / 1000).toFixed(1)}k`.replace('.0k', 'k');
        return `${(count / 1000000).toFixed(1)}M`.replace('.0M', 'M');
    };

    return (
        <div
            className={`pack-card-sm ${!isLoggedIn ? 'disabled-sm' : ''}`}
            onClick={handleClick}
        >
            <div className="pack-card-image-sm">
                <img src={pack.coverImage} alt={pack.title} />
                <div className="pack-card-overlay-sm">
                    {!isLoggedIn && (
                        <div className="login-required-badge-sm">
                            🔒 Login to view
                        </div>
                    )}
                </div>
            </div>

            <div className="pack-card-content-sm">
                <h3 className="pack-card-title-sm">{pack.title}</h3>
                <p className="pack-card-artist-sm">{pack.artist}</p>

                <div className="pack-card-meta-sm">
                    <span className="pack-card-samples-sm">
                        🎵 {pack.sampleCount} samples
                    </span>
                    {pack.rating && pack.rating > 0 && (
                        <span className="pack-card-rating-sm">
                            <FaStar className="star-icon-sm" />
                            {pack.rating.toFixed(1)}
                        </span>
                    )}
                    {pack.downloads !== undefined && pack.downloads > 0 && (
                        <span className="pack-card-downloads-sm">
                            <FaDownload className="download-icon-sm" />
                            {formatDownloads(pack.downloads)}
                        </span>
                    )}
                </div>

                <div className="pack-card-genres-sm">
                    {pack.genres.slice(0, 2).map((genre, index) => (
                        <span key={index} className="genre-badge-sm">
                            {genre}
                        </span>
                    ))}
                    {pack.genres.length > 2 && (
                        <span className="genre-badge-sm more-sm">+{pack.genres.length - 2}</span>
                    )}
                </div>

                <div className="pack-card-footer-sm">
                    <span className="pack-card-price-sm">${pack.price.toFixed(2)}</span>
                    {isLoggedIn ? (
                        <button className="pack-card-btn-sm">View Pack</button>
                    ) : (
                        <button className="pack-card-btn-sm disabled-sm" disabled>
                            Login Required
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PackCardSmall;
// src/components/SampleItem.tsx
import React, { useState, useEffect } from 'react';
import {useSnapshot} from 'valtio';
import {FaDownload, FaHeart, FaShoppingCart, FaCheck, FaEdit, FaTrash} from 'react-icons/fa';
import {audioPlayerStore, audioPlayerActions} from '../../state/audioPlayer.store';
import {cartState} from '../../state/CartItemState';
import { MdOutlineCallSplit } from "react-icons/md";
import type {AudioSample} from '../../types';
import {addSampleToCart} from '../../services/cartService';
import {useAuth} from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

import './SampleItem.css';

// Import your custom icons
import playIcon from '../../assets/play-button.png';
import pauseIcon from '../../assets/pause-button.png';
import {sampleApi} from "../../api/sample.api";

interface SampleItemProps {
    sample: AudioSample,
    onDownload: () => void,
    onLike: () => void,
    onEdit?: () => void,
    onDelete?: () => void,
    doesExistAsStandAlone?: boolean
    onUnbind?: () => void,
}

const SampleItem: React.FC<SampleItemProps> = ({
                                                   sample,
                                                   onDownload,
                                                   onLike,
                                                   onEdit,
                                                   onDelete,
                                                   doesExistAsStandAlone,
                                                   onUnbind,
                                               }) => {
    const audioSnap = useSnapshot(audioPlayerStore);
    const cartSnap = useSnapshot(cartState);
    const {user} = useAuth();
    const navigate = useNavigate();
    // Like state
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isLikeLoading, setIsLikeLoading] = useState(false);

    // Check if this sample is currently playing
    const isPlaying = audioSnap.isPlaying && audioSnap.currentSample?.id === sample.id;
    const isLoading = audioSnap.isLoading && audioSnap.currentSample?.id === sample.id;
    const inCart = cartSnap.items.some(item => item.id === sample.id && item.type === 'sample');

    // Check if current user is the creator of this sample
    const isCreator = user?.id === sample.authorId;

    // Load like status on mount
    useEffect(() => {
        const loadLikeStatus = async () => {
            if (!user || isCreator) return; // Don't load for non-authenticated users or creators

            try {
                const response = await sampleApi.getLikeStatus(sample.id);
                if (response.data) {
                    setIsLiked(response.data.isLiked || false);
                    setLikesCount(response.data.likesCount || 0);
                }
            } catch (error) {
                console.error('Error loading like status:', error);
            }
        };

        loadLikeStatus();
    }, [sample.id, user, isCreator]);

    const handleTogglePlay = async () => {
        // If already playing this sample, pause it
        if (isPlaying) {
            audioPlayerActions.pause();
            return;
        }

        // If playing a different sample, stop it and play this one
        if (audioSnap.currentSample && audioSnap.currentSample.id !== sample.id) {
            audioPlayerActions.stop();
            // Small delay to ensure clean state
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        try {
            console.log('Playing sample:', sample.name);
            await audioPlayerActions.playSampleFast(sample);
        } catch (error) {
            console.error('Playback failed:', error);
            // Fallback to normal play if fast play fails
            try {
                await audioPlayerActions.playSample(sample);
            } catch (fallbackError) {
                console.error('Fallback playback also failed:', fallbackError);
            }
        }
    };

    const handleAddToCart = () => {
        if (!inCart && !isCreator) { // Don't allow creators to buy their own samples
            addSampleToCart({
                id: sample.id,
                name: sample.name,
                url: sample.audioUrl,
                duration: sample.duration,
                artist: sample.artist,
                bpm: sample.bpm,
                key: sample.key,
                genre: sample.genre,
                price: sample.price ?? 0,
            });
        }
    };

    const handleLikeToggle = async () => {
        if (isLikeLoading || isCreator) return;

        setIsLikeLoading(true);
        try {
            const response = await sampleApi.toggleLike(sample.id);
            if (response.data) {
                setIsLiked(response.data.isLiked);
                setLikesCount(response.data.likesCount);
            }
            // Call parent callback if needed
            onLike?.();
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setIsLikeLoading(false);
        }
    };

    // Format time for display
    const formatTime = (seconds: number): string => {
        if (!seconds || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Format likes count (1000 -> 1k, 1500 -> 1.5k, etc.)
    const formatLikesCount = (count: number): string => {
        if (count < 1000) return count.toString();
        if (count < 1000000) return `${(count / 1000).toFixed(1)}k`.replace('.0k', 'k');
        return `${(count / 1000000).toFixed(1)}M`.replace('.0M', 'M');
    };

    return (
        <div className={`sample-item ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}>
            <div className="sample-main">
                {/* Play Button with IMAGE icons */}
                <button
                    className={`play-button ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}
                    onClick={handleTogglePlay}
                    disabled={isLoading}
                    aria-label={isPlaying ? 'Pause' : isLoading ? 'Loading...' : 'Play'}
                >
                    {isLoading ? (
                        <div className="loading-spinner-small"></div>
                    ) : isPlaying ? (
                        <img
                            src={pauseIcon}
                            alt="Pause"
                            className="play-icon"
                            onError={(e) => {
                                // Fallback if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextSibling?.remove(); // Remove any fallback text
                                const fallback = document.createElement('span');
                                fallback.textContent = '❚❚';
                                fallback.style.color = 'white';
                                fallback.style.fontSize = '20px';
                                fallback.style.fontWeight = 'bold';
                                target.parentNode?.appendChild(fallback);
                            }}
                        />
                    ) : (
                        <img
                            src={playIcon}
                            alt="Play"
                            className="play-icon"
                            onError={(e) => {
                                // Fallback if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextSibling?.remove(); // Remove any fallback text
                                const fallback = document.createElement('span');
                                fallback.textContent = '▶';
                                fallback.style.color = 'white';
                                fallback.style.fontSize = '20px';
                                fallback.style.fontWeight = 'bold';
                                target.parentNode?.appendChild(fallback);
                            }}
                        />
                    )}
                </button>

                {/* Sample Info */}
                <div className="sample-info">
                    <h3 className="sample-name">{sample.name}</h3>

                    {isCreator && !doesExistAsStandAlone && (
                        <p className="sample-name">${sample.price.toFixed(2)}</p>
                    )}

                    {sample.packTitle && <p>Pack: {sample.packTitle}</p>}

                    <div className="sample-meta">

                        {/* Duration */}
                        {sample.duration != null && (
                            <span className="meta-item">
                <span className="meta-text">duration: {formatTime(sample.duration)}</span>
            </span>
                        )}

                        {/* BPM — FIXED */}
                        {sample.bpm != null && (
                            <span className="meta-item">
                <span className="meta-text">BPM: {sample.bpm}</span>
            </span>
                        )}

                        {sample.authorId != null && (
                            <span className="meta-item">
        <button
            className="meta-text author-link"
            onClick={() => navigate(`/user/${sample.authorId}`)}
        >
            👤 Author
        </button>
    </span>
                        )}

                        {/* Key */}
                        {sample.key && (
                            <span className="meta-item">
                <span className="meta-text">Key: {sample.key}</span>
            </span>
                        )}

                        {/* Genre */}
                        {sample.genre && (
                            <span className="sample-genre">{sample.genre}</span>
                        )}

                        {/* Tags */}
                        {sample.tags?.length > 0 && (
                            <div className="sample-tags">
                                {sample.tags.map((tag, i) => (
                                    <span key={i} className="sample-tag">#{tag}</span>
                                ))}
                            </div>
                        )}

                        {/* Creator badge */}
                        {isCreator && (
                            <span className="creator-badge">Your Sample</span>
                        )}

                        {/* If exists only inside pack */}
                        {doesExistAsStandAlone && (
                            <p className="creator-badge">buy with {sample.packTitle}</p>
                        )}
                    </div>
                </div>


                {/* Price - Hide for creator */}
                {!isCreator && sample.price !== undefined && sample.price > 0 && (
                    <div className="sample-price">
                        ${sample.price.toFixed(2)}
                    </div>
                )}

            </div>

            {/* Actions with React Icons */}
            <div className="sample-actions">
                {isCreator ? (
                    // Creator actions - Edit and Delete
                    <>
                        <button
                            className="action-icon-btn edit-btn"
                            onClick={onEdit}
                            aria-label="Edit sample"
                            title="Edit sample"
                        >
                            <FaEdit className="action-icon"/>
                        </button>

                        <button
                            className="action-icon-btn delete-btn"
                            onClick={onDelete}
                            aria-label="Delete sample"
                            title="Delete sample"
                        >
                            <FaTrash className="action-icon"/>
                        </button>

                        <button
                            className="action-icon-btn"
                            onClick={onDownload}
                            aria-label="Download sample"
                            title="Download sample"
                        >
                            <FaDownload className="action-icon"/>
                        </button>
                        {! doesExistAsStandAlone &&
                            <button
                                className="action-icon-btn"
                                onClick={onUnbind}
                                aria-label="Download sample"
                                title="Unbind sample from pack"
                            >
                                <MdOutlineCallSplit className="action-icon"/>
                            </button>
                        }
                    </>
                ) : (
                    // Regular user actions - Cart, Download, Like
                    <>
                        {sample.price !== 0 && (
                        <button
                            className={`action-icon-btn ${inCart ? 'in-cart' : ''}`}
                            onClick={handleAddToCart}
                            disabled={inCart}
                            aria-label={inCart ? 'Already in cart' : 'Add to cart'}
                            title={inCart ? 'Already in cart' : 'Add to cart'}
                        >
                            {inCart ? (
                                <FaCheck className="action-icon"/>
                            ) : (
                                <FaShoppingCart className="action-icon"/>
                            )}
                        </button>
                        )}

                        <button
                            className="action-icon-btn"
                            onClick={onDownload}
                            aria-label="Download sample"
                            title="Download sample"
                        >
                            <FaDownload className="action-icon"/>
                        </button>

                        <div className="like-container">
                            <button
                                className={`action-icon-btn like-btn ${isLiked ? 'liked' : ''}`}
                                onClick={handleLikeToggle}
                                disabled={isLikeLoading}
                                aria-label={isLiked ? 'Unlike sample' : 'Like sample'}
                                title={isLiked ? 'Unlike sample' : 'Like sample'}
                            >
                                <FaHeart className="action-icon"/>
                            </button>
                            {likesCount > 0 && (
                                <span className="likes-count">{formatLikesCount(likesCount)}</span>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Progress bar for currently playing sample */}
            {isPlaying && audioSnap.duration > 0 && (
                <div className="playback-progress">
                    <div
                        className="progress-bar"
                        style={{
                            width: `${(audioSnap.currentTime / audioSnap.duration) * 100}%`
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default SampleItem;
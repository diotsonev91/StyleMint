import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import {clothDesignApi, DesignPublicDTO} from "../api/clothDesign.api";

import "./home.css";
import PackCardSmall from "../components/sounds/PackCardSmall";

import {packApi} from "../api/pack.api";
import DesignCardSmall from "../components/three/cards/DesignCardSmall";

interface SamplePack {
    id: string;
    title: string;
    artist: string;
    coverImage: string;
    price: number;
    sampleCount: number;
    rating?: number;
    downloads?: number;
    genres: string[];
}

const Home: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [latestPacks, setLatestPacks] = useState<SamplePack[]>([]);
    const [topRatedPacks, setTopRatedPacks] = useState<SamplePack[]>([]);
    const [mostDownloadedPacks, setMostDownloadedPacks] = useState<SamplePack[]>([]);
    const [topLikedDesigns, setTopLikedDesigns] = useState<DesignPublicDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        try {
            setLoading(true);
            setError(null);

            const [latestRes, topRatedRes, mostDownloadedRes, topLikedRes] = await Promise.all([
                packApi.getLatestPacks(),
                packApi.getTopRatedPacks(),
                packApi.getMostDownloadedPacks(),
                clothDesignApi.getTopLikedDesigns(4)
            ]);

            setLatestPacks(latestRes.data || []);
            setTopRatedPacks(topRatedRes.data || []);
            setMostDownloadedPacks(mostDownloadedRes.data || []);

            // Get top liked designs
            const topDesigns = topLikedRes.data || [];

            if (topDesigns.length > 0) {
                // Extract design IDs
                const designIds = topDesigns.map(design => design.id);

                // Get likes count for these designs
                const likesResponse = await clothDesignApi.getLikesCountForDesigns(designIds);

                if (likesResponse.success && likesResponse.data) {
                    // Map likes count to designs
                    const designsWithLikes = topDesigns.map(design => ({
                        ...design,
                        likesCount: likesResponse.data![design.id] || 0
                    }));

                    setTopLikedDesigns(designsWithLikes);
                } else {
                    // If likes fetch fails, use designs with existing likesCount from backend
                    setTopLikedDesigns(topDesigns);
                }
            } else {
                setTopLikedDesigns([]);
            }
        } catch (err) {
            console.error('Error loading content:', err);
            setError('Failed to load content. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="home">
            <section className="hero">
                <h1>Style Your Look. Sample Your Sound.</h1>
                <p>
                    Blend fashion and music into one creative identity — customize your 3D wear
                    and discover exclusive sound packs.
                </p>
            </section>

            <main className="home-content">
                {/* Four Column Layout - 3 Pack Sections + 1 Design Section */}
                <div className="packs-columns-container">
                    {/* Latest Packs Column */}
                    <section className="pack-column">
                        <div className="section-header">
                            <h2 className="section-title">🆕 Latest Releases</h2>
                            <p className="section-subtitle">Fresh new packs from top producers</p>
                        </div>

                        {loading ? (
                            <div className="packs-loading">
                                <div className="loading-spinner"></div>
                                <p>Loading...</p>
                            </div>
                        ) : error ? (
                            <div className="packs-error">
                                <p>{error}</p>
                            </div>
                        ) : latestPacks.length === 0 ? (
                            <div className="packs-empty">
                                <p>No packs available yet</p>
                            </div>
                        ) : (
                            <div className="packs-column-grid">
                                {latestPacks.slice(0, 4).map((pack) => (
                                    <PackCardSmall
                                        key={pack.id}
                                        pack={pack}
                                        isLoggedIn={!!user}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Top Rated Packs Column */}
                    <section className="pack-column">
                        <div className="section-header">
                            <h2 className="section-title">⭐ Top Rated</h2>
                            <p className="section-subtitle">Highest rated packs by our community</p>
                        </div>

                        {loading ? (
                            <div className="packs-loading">
                                <div className="loading-spinner"></div>
                                <p>Loading...</p>
                            </div>
                        ) : topRatedPacks.length === 0 ? (
                            <div className="packs-empty">
                                <p>No rated packs yet</p>
                            </div>
                        ) : (
                            <div className="packs-column-grid">
                                {topRatedPacks.slice(0, 4).map((pack) => (
                                    <PackCardSmall
                                        key={pack.id}
                                        pack={pack}
                                        isLoggedIn={!!user}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Most Downloaded Packs Column */}
                    <section className="pack-column">
                        <div className="section-header">
                            <h2 className="section-title">🔥 Most Downloaded</h2>
                            <p className="section-subtitle">Popular packs everyone loves</p>
                        </div>

                        {loading ? (
                            <div className="packs-loading">
                                <div className="loading-spinner"></div>
                                <p>Loading...</p>
                            </div>
                        ) : mostDownloadedPacks.length === 0 ? (
                            <div className="packs-empty">
                                <p>No downloaded packs yet</p>
                            </div>
                        ) : (
                            <div className="packs-column-grid">
                                {mostDownloadedPacks.slice(0, 4).map((pack) => (
                                    <PackCardSmall
                                        key={pack.id}
                                        pack={pack}
                                        isLoggedIn={!!user}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Separator Line */}
                    <div className="section-separator">
                        <div className="separator-line"></div>
                        <div className="separator-icon">✨</div>
                        <div className="separator-line"></div>
                    </div>

                    {/* Top Liked Designs Column */}
                    <section className="pack-column">
                        <div className="section-header">
                            <h2 className="section-title">❤️ Top Liked Designs</h2>
                            <p className="section-subtitle">Most loved fashion designs</p>
                        </div>

                        {loading ? (
                            <div className="packs-loading">
                                <div className="loading-spinner"></div>
                                <p>Loading...</p>
                            </div>
                        ) : topLikedDesigns.length === 0 ? (
                            <div className="packs-empty">
                                <p>No designs yet</p>
                            </div>
                        ) : (
                            <div className="packs-column-grid">
                                {topLikedDesigns.slice(0, 4).map((design) => (
                                    <DesignCardSmall
                                        key={design.id}
                                        design={design}
                                        isLoggedIn={!!user}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Login CTA Section */}
                {!user && (
                    <section className="login-section">
                        <h2 className="login-heading">Want to explore more?</h2>
                        <p className="login-description">
                            Login to access full pack details, preview samples, and start building your sound library
                        </p>
                        <button className="login-cta-btn" onClick={handleLoginClick}>
                            Login Now
                        </button>
                    </section>
                )}
            </main>
        </div>
    );
};

export default Home;
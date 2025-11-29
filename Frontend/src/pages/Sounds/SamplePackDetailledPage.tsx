// src/components/SamplePackDetailledPage.tsx - Fixed to use API
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SamplePack } from '../../types';
import PackInfo from '../../components/sounds/PackInfo';
import TabNavigation from '../../components/sounds/TabNavigation';
import SamplesList from '../../components/sounds/SamplesList';
import PackDetails from '../../components/sounds/PackDetails';
import './SamplePackDetailedPage.css';
import { audioPackService } from '../../services/audioPackService';
import { addSamplePackToCart } from '../../services/cartService';
import {getCurrentUser} from "../../api/auth";

const SamplePackDetailledPage: React.FC = () => {
  const { packId } = useParams<{ packId: string }>();
  const [activeTab, setActiveTab] = useState<'samples' | 'details'>('samples');
  const [samplePack, setSamplePack] = useState<SamplePack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
  // ✅ Fetch pack from API by ID
  useEffect(() => {
    const fetchPack = async () => {
      if (!packId) {
        setError('No pack ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // Call API to get pack with samples
      const response = await audioPackService.getPackWithSamples(packId);

      // Debug: Log raw response to see backend format
      console.log('🔍 Raw API response:', response);
      console.log('🔍 Response data:', response.data);

      if (response.success && response.data) {
        // ✅ Backend returns nested structure: { pack: {...}, samples: [...] }
        const packData = (response.data as any).pack || response.data;
        const samplesData = (response.data as any).samples || packData.samples || [];
        const currentUser = await getCurrentUser();
        const isOwner = currentUser && packData.authorId === currentUser.id;
        // Transform backend response to ensure all required fields exist
        const transformedPack: SamplePack = {
          ...packData,
          // Ensure title exists
          title: packData.title || packData.name || 'Untitled Pack',
          // Ensure artist exists
          artist: packData.artist || packData.author || 'Unknown Artist',
          // Ensure arrays exist (prevent .map() errors)
            isLoggedUserPack: isOwner,
          genres: Array.isArray(packData.genres) ? packData.genres : [],
          tags: Array.isArray(packData.tags) ? packData.tags : [],
          samples: Array.isArray(samplesData) ? samplesData : [],
          // Ensure other fields have defaults
          sampleCount: packData.sampleCount || samplesData.length || 0,
          totalSize: packData.totalSize || '0 MB',
          description: packData.description || '',
          price: packData.price ?? 0,
          coverImage: packData.coverImage || 'https://via.placeholder.com/400'
        };
        
        setSamplePack(transformedPack);
        console.log(`✅ Loaded pack "${transformedPack.title}" by ${transformedPack.artist} with ${transformedPack.samples?.length || 0} samples`);
        console.log('✅ Transformed pack data:', transformedPack);
      } else {
        setError(response.error || 'Failed to load pack');
        console.error(`❌ Error loading pack with ID "${packId}":`, response.error);
      }

      setLoading(false);
    };

    fetchPack();
  }, [packId]);

  const handleAddToCart = () => {
    if (!samplePack) return;
    
    console.log(`📦 Adding pack "${samplePack.title}" to cart...`);
    addSamplePackToCart(samplePack);
    console.log(`✅ Added "${samplePack.title}" with ${samplePack.samples?.length || 0} samples to cart`);
    
    // Optional: Show success notification
    alert(`Added "${samplePack.title}" to cart!`);
  };



// ⭐⭐⭐ Download pack as ZIP (RECOMMENDED) ⭐⭐⭐
    const handleDownloadPreview = async () => {
        if (!samplePack || !packId) return;

        try {
            console.log(`📦 Downloading pack "${samplePack.title}" as ZIP...`);
            setIsDownloading(true);

            // ⭐ Call ZIP download method
            const result = await audioPackService.downloadPackAsZip(packId);

            if (result.success) {
                // Success!
                console.log(`✅ Pack downloaded as ZIP!`);

                alert(
                    `✅ Successfully downloaded "${samplePack.title}"!\n` +
                    `All ${samplePack.sampleCount} samples are in the ZIP file.`
                );

            } else {
                // Error - user not authorized or download failed
                console.error('❌ Download failed:', result.error);

                alert(
                    result.error ||
                    'Failed to download pack. You may need to purchase it first.'
                );
            }

        } catch (error) {
            console.error('❌ Download error:', error);
            alert('An unexpected error occurred while downloading the pack.');

        } finally {
            setIsDownloading(false);
        }
    };

  const handleShare = () => {
    if (!samplePack) return;
    
    console.log('Share pack:', samplePack.id);
    if (navigator.share) {
      navigator.share({
        title: samplePack.title,
        text: `Check out ${samplePack.title} by ${samplePack.artist}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleLoadMore = () => {
    console.log('Load more samples');
    // Implement pagination if needed
  };

  if (loading) {
    return (
      <div className="samples-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading sample pack...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="samples-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    );
  }

  if (!samplePack) {
    return (
      <div className="samples-page">
        <div className="error-container">
          <p>Sample pack not found</p>
          <button onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="samples-page">
      <main className="main-content">
        <div className="container">
          <div className="content-grid">
            {/* Left Sidebar - Pack Info */}
            <aside className="sidebar">
                <PackInfo
                    pack={samplePack}
                    onAddToCart={handleAddToCart}
                    onDownloadPreview={handleDownloadPreview}
                    onShare={handleShare}
                    isDownloading={isDownloading} // ⭐ NEW
                />
            </aside>

            {/* Main Content Area */}
            <section className="content-area">
              <TabNavigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
                sampleCount={samplePack.sampleCount}
              />

              {activeTab === 'samples' ? (
               <SamplesList
  samples={samplePack.samples || []}
  {...(samplePack.sampleCount > 10 ? { onLoadMore: handleLoadMore } : {})}
/>
              ) : (
                <PackDetails pack={samplePack} />
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SamplePackDetailledPage;
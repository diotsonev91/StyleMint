// src/components/SamplePackDetailledPage.tsx - Fixed import
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SamplePack } from '../../types';
import PackInfo from '../../components/sounds/PackInfo';
import TabNavigation from '../../components/sounds/TabNavigation';
import SamplesList from '../../components/sounds/SamplesList';
import PackDetails from '../../components/sounds/PackDetails';
import './SamplePackDetailedPage.css';
import mockPacks from '../../mock/mockPacks'; 
import { addSamplePackToCart } from '../../services/CartService';

const SamplePackDetailledPage: React.FC = () => {
  const { packId } = useParams<{ packId: string }>();
  const [activeTab, setActiveTab] = useState<'samples' | 'details'>('samples');
  const [samplePack, setSamplePack] = useState<SamplePack | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load pack from mockPacks by ID
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const pack = mockPacks.find(p => p.id === packId);
      console.log(packId)
      if (pack) {
        setSamplePack(pack);
        console.log(`✅ Loaded pack "${pack.title}" with ${pack.samples.length} samples`);
      } else {
        console.error(`❌ Pack with ID "${packId}" not found`);
      }
      
      setLoading(false);
    }, 500);
  }, [packId]);

  const handleAddToCart = () => {
    if (!samplePack) return;
    
    console.log(`📦 Adding pack "${samplePack.title}" to cart...`);
    addSamplePackToCart(samplePack);
    console.log(`✅ Added "${samplePack.title}" with ${samplePack.samples.length} samples to cart`);
    
    // Optional: Show success notification
    alert(`Added "${samplePack.title}" to cart!`);
  };

  const handleDownloadPreview = () => {
    if (!samplePack) return;
    
    console.log('Download preview:', samplePack.id);
    alert('Downloading preview... (This would call your API endpoint)');
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
                  samples={samplePack.samples} 
                  onLoadMore={handleLoadMore}
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
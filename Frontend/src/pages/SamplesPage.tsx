// src/components/SamplesPage.tsx
import React, { useState, useEffect } from 'react';
import { SamplePack } from '../types';
import PackInfo from '../components/sounds/PackInfo';
import TabNavigation from '../components/sounds/TabNavigation';
import SamplesList from '../components/sounds/SamplesList';
import PackDetails from '../components/sounds/PackDetails';
import './SamplesPage.css';

const SamplesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'samples' | 'details'>('samples');
  const [samplePack, setSamplePack] = useState<SamplePack | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API call
  useEffect(() => {
    const mockData: SamplePack = {
      id: 1,
      title: "Essential Afro House",
      artist: "Toolroom Records",
      coverImage: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80",
      price: 29.99,
      sampleCount: 245,
      totalSize: "1.2 GB",
      description: "Dive deep into the vibrant world of Afro House with this essential collection. Featuring authentic percussion, hypnotic basslines, soulful vocals, and infectious grooves that capture the essence of African-inspired house music. Perfect for producers looking to add authentic African flavor to their productions.",
      genres: ["Afro House", "Deep House", "Tech House"],
      tags: ["Percussion", "Vocals", "Bass", "Drums", "Loops", "One-Shots"],
      samples: [
        { 
          id: 1, 
          name: "Afro_Percussion_Loop_125bpm", 
          duration: "0:08", 
          bpm: 125, 
          key: "Am", 
          genre: "Afro House", 
          audioUrl: "#" 
        },
        { 
          id: 2, 
          name: "Deep_Bass_One_Shot", 
          duration: "0:03", 
          key: "C", 
          genre: "Deep House", 
          audioUrl: "#" 
        },
        { 
          id: 3, 
          name: "Vocal_Chant_Loop_120bpm", 
          duration: "0:16", 
          bpm: 120, 
          key: "Gm", 
          genre: "Afro House", 
          audioUrl: "#" 
        },
        { 
          id: 4, 
          name: "Kick_Drum_Punchy", 
          duration: "0:01", 
          genre: "Tech House", 
          audioUrl: "#" 
        },
        { 
          id: 5, 
          name: "Shaker_Loop_125bpm", 
          duration: "0:04", 
          bpm: 125, 
          genre: "Afro House", 
          audioUrl: "#" 
        },
        { 
          id: 6, 
          name: "Synth_Pad_Ambient", 
          duration: "0:32", 
          bpm: 120, 
          key: "Dm", 
          genre: "Deep House", 
          audioUrl: "#" 
        },
        { 
          id: 7, 
          name: "Hihat_Roll_Pattern", 
          duration: "0:02", 
          bpm: 125, 
          genre: "Tech House", 
          audioUrl: "#" 
        },
        { 
          id: 8, 
          name: "Marimba_Melody_Loop", 
          duration: "0:16", 
          bpm: 122, 
          key: "F", 
          genre: "Afro House", 
          audioUrl: "#" 
        }
      ]
    };

    // Simulate API call
    setTimeout(() => {
      setSamplePack(mockData);
      setLoading(false);
    }, 500);
  }, []);

  const handleAddToCart = () => {
    console.log('Add to cart:', samplePack?.id);
    alert('Added to cart! (This would integrate with your Spring Boot backend)');
  };

  const handleDownloadPreview = () => {
    console.log('Download preview:', samplePack?.id);
    alert('Downloading preview... (This would call your API endpoint)');
  };

  const handleShare = () => {
    console.log('Share pack:', samplePack?.id);
    if (navigator.share) {
      navigator.share({
        title: samplePack?.title,
        text: `Check out ${samplePack?.title} by ${samplePack?.artist}`,
        url: window.location.href
      });
    } else {
      alert('Share functionality would copy link to clipboard');
    }
  };

  const handleLoadMore = () => {
    console.log('Load more samples');
    // Implement pagination
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

export default SamplesPage;

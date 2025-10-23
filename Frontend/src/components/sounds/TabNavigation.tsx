// src/components/TabNavigation.tsx
import React from 'react';
import './TabNavigation.css';

interface TabNavigationProps {
  activeTab: 'samples' | 'details';
  onTabChange: (tab: 'samples' | 'details') => void;
  sampleCount: number;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  sampleCount 
}) => {
  return (
    <div className="tab-navigation">
      <button
        className={`tab-button ${activeTab === 'samples' ? 'active' : ''}`}
        onClick={() => onTabChange('samples')}
      >
        Samples ({sampleCount})
      </button>
      <button
        className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
        onClick={() => onTabChange('details')}
      >
        Details
      </button>
    </div>
  );
};

export default TabNavigation;

// src/components/AddMintToItem.tsx
import React, { useState } from 'react';
import './AddMintToItem.css';

type ItemType = 'clothing' | 'sample' | 'pack';

type MintType = 
  // Clothing Mints
  | 'redeemable'
  | 'loyalty-discount'
  | 'authenticity'
  | 'dynamic-value'
  // Sample/Pack Mints
  | 'license-personal'
  | 'license-commercial'
  | 'exclusive'
  | 'royalty-backed'
  | 'upgradeable'
  | 'access-unlock'
  | 'creator-signature'
  // Cross-Utility
  | 'cross-utility-sample'
  | 'cross-utility-clothing';

interface CrossUtilityPerk {
  type: 'free-sample' | 'discount-code' | 'free-item' | 'early-access';
  value: string;
}

const AddMintToItem: React.FC = () => {
  const [itemType, setItemType] = useState<ItemType>('clothing');
  const [selectedMintType, setSelectedMintType] = useState<MintType | null>(null);
  
  // Item Details
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemImage, setItemImage] = useState<File | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState('');
  const [basePrice, setBasePrice] = useState('');
  
  // NFT Mint Configuration
  const [mintPrice, setMintPrice] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [royaltyPercentage, setRoyaltyPercentage] = useState('');
  
  // Type-specific fields
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [dynamicPriceMultiplier, setDynamicPriceMultiplier] = useState('');
  const [upgradePrice, setUpgradePrice] = useState('');
  const [accessDuration, setAccessDuration] = useState('');
  
  // Cross-utility
  const [crossUtilityPerks, setCrossUtilityPerks] = useState<CrossUtilityPerk[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setItemImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mint type definitions
  const mintTypes = {
    clothing: [
      {
        id: 'redeemable' as MintType,
        name: 'Redeemable Mint',
        icon: '🎟️',
        description: 'NFT gives right to claim 1 physical item. After redemption, NFT becomes "Used" (soulbound or flagged)',
        features: ['One-time redemption', 'Physical item claim', 'Limited edition support', 'Post-redeem tracking']
      },
      {
        id: 'loyalty-discount' as MintType,
        name: 'Loyalty / Discount Mint',
        icon: '💎',
        description: 'Purchase clothing → receive NFT giving discount on future purchases. Valuable for resale to frequent shoppers',
        features: ['Perpetual discount', 'Transferable benefit', 'Increased resale value', 'Customer retention']
      },
      {
        id: 'authenticity' as MintType,
        name: 'Authenticity Certificate',
        icon: '✅',
        description: 'NFT certifies item is from verified designer. Includes verified creator badge, timestamp, proof of origin',
        features: ['Verified creator', 'Timestamp proof', 'Anti-counterfeit', 'Provenance tracking']
      },
      {
        id: 'dynamic-value' as MintType,
        name: 'Dynamic Value Mint',
        icon: '📈',
        description: 'NFT automatically increases floor price based on: collection sellout, resale volume, review scores/likes',
        features: ['Auto price adjustment', 'Market-driven value', 'Hype tracking', 'Review integration']
      }
    ],
    sample: [
      {
        id: 'license-personal' as MintType,
        name: 'License - Personal Use',
        icon: '🎵',
        description: 'Allows use in non-commercial music. Cannot be resold for licensing',
        features: ['Non-commercial use', 'Personal projects', 'No sublicensing', 'Basic rights']
      },
      {
        id: 'license-commercial' as MintType,
        name: 'License - Commercial Use',
        icon: '💼',
        description: 'Can be used in sold/monetized projects. No sublicensing allowed',
        features: ['Commercial projects', 'Monetization rights', 'No sublicense', 'Revenue generation']
      },
      {
        id: 'exclusive' as MintType,
        name: 'Exclusive Mint',
        icon: '👑',
        description: 'After NFT purchase, sample is removed from store. Only holder can use it forever',
        features: ['Complete exclusivity', 'Store removal', 'Lifetime rights', 'Unique ownership']
      },
      {
        id: 'royalty-backed' as MintType,
        name: 'Royalty-Backed Mint',
        icon: '💰',
        description: 'If someone uses sample in revenue-generating track, holder receives % from secondary sales or resales',
        features: ['Revenue sharing', 'Passive income', 'Usage tracking', 'Resale royalties']
      },
      {
        id: 'upgradeable' as MintType,
        name: 'Upgradeable Mint',
        icon: '⬆️',
        description: 'Buy Personal → can "burn+pay" → becomes Commercial. Smart license upgrade flow',
        features: ['License upgrade', 'Burn mechanism', 'Smart contract flow', 'Flexible licensing']
      },
      {
        id: 'access-unlock' as MintType,
        name: 'Access / Pack Unlock',
        icon: '🔓',
        description: 'NFT grants access to entire bundle (drums pack/stems). Perks: early access, private library, secret drops',
        features: ['Bundle access', 'Early releases', 'Private content', 'Exclusive drops']
      },
      {
        id: 'creator-signature' as MintType,
        name: 'Creator Signature Mint',
        icon: '✍️',
        description: 'Sample signed by verified creator with digital signature and authenticity proof',
        features: ['Creator verified', 'Digital signature', 'Authenticity proof', 'Collector value']
      }
    ],
    crossUtility: [
      {
        id: 'cross-utility-sample' as MintType,
        name: 'Clothing → Sample Perk',
        icon: '👕➜🎵',
        description: 'Buy Hoodie NFT → receive 1 free Premium Sample Mint',
        features: ['Cross-category benefit', 'Bundle value', 'Customer incentive', 'Ecosystem growth']
      },
      {
        id: 'cross-utility-clothing' as MintType,
        name: 'Sample → Clothing Perk',
        icon: '🎵➜👕',
        description: 'Buy Sample NFT → receive coupon for physical t-shirt',
        features: ['Physical reward', 'Cross-promotion', 'Added value', 'Brand loyalty']
      }
    ]
  };

  const getCurrentMintTypes = () => {
    if (itemType === 'clothing') {
      return [...mintTypes.clothing, ...mintTypes.crossUtility.filter(m => m.id === 'cross-utility-sample')];
    } else {
      return [...mintTypes.sample, ...mintTypes.crossUtility.filter(m => m.id === 'cross-utility-clothing')];
    }
  };

  const addCrossUtilityPerk = () => {
    setCrossUtilityPerks([...crossUtilityPerks, { type: 'discount-code', value: '' }]);
  };

  const updatePerk = (index: number, field: keyof CrossUtilityPerk, value: string) => {
    const newPerks = [...crossUtilityPerks];
    newPerks[index] = { ...newPerks[index], [field]: value };
    setCrossUtilityPerks(newPerks);
  };

  const removePerk = (index: number) => {
    setCrossUtilityPerks(crossUtilityPerks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMintType) {
      alert('Please select a mint type');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    
    // Item data
    formData.append('itemType', itemType);
    formData.append('itemName', itemName);
    formData.append('itemDescription', itemDescription);
    formData.append('basePrice', basePrice);
    if (itemImage) formData.append('itemImage', itemImage);
    
    // Mint data
    formData.append('mintType', selectedMintType);
    formData.append('mintPrice', mintPrice);
    formData.append('totalSupply', totalSupply);
    formData.append('royaltyPercentage', royaltyPercentage);
    
    // Type-specific data
    if (discountPercentage) formData.append('discountPercentage', discountPercentage);
    if (dynamicPriceMultiplier) formData.append('dynamicPriceMultiplier', dynamicPriceMultiplier);
    if (upgradePrice) formData.append('upgradePrice', upgradePrice);
    if (accessDuration) formData.append('accessDuration', accessDuration);
    
    // Cross-utility perks
    if (crossUtilityPerks.length > 0) {
      formData.append('crossUtilityPerks', JSON.stringify(crossUtilityPerks));
    }

    try {
      const response = await fetch('http://localhost:8080/api/nft/create-mint', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('NFT Mint created successfully!');
        resetForm();
      } else {
        alert('Failed to create mint. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating mint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setItemName('');
    setItemDescription('');
    setItemImage(null);
    setItemImagePreview('');
    setBasePrice('');
    setMintPrice('');
    setTotalSupply('');
    setRoyaltyPercentage('');
    setSelectedMintType(null);
    setDiscountPercentage('');
    setDynamicPriceMultiplier('');
    setUpgradePrice('');
    setAccessDuration('');
    setCrossUtilityPerks([]);
  };

  return (
    <div className="add-mint-page">
      {/* Background */}
      <div className="mint-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="mint-container">
        {/* Header */}
        <header className="mint-header">
          <div className="mint-icon-large">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="mint-title">
            Add <span className="gradient-text">NFT Mint</span> to Item
          </h1>
          <p className="mint-subtitle">
            Create powerful NFT utilities for your products
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mint-form">
          {/* Step 1: Item Type Selection */}
          <div className="form-section">
            <h2 className="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Step 1: Select Item Type
            </h2>

            <div className="item-type-selector">
              <button
                type="button"
                className={`item-type-btn ${itemType === 'clothing' ? 'active' : ''}`}
                onClick={() => {
                  setItemType('clothing');
                  setSelectedMintType(null);
                }}
              >
                <span className="type-icon">👕</span>
                <span className="type-label">Clothing</span>
              </button>
              <button
                type="button"
                className={`item-type-btn ${itemType === 'sample' ? 'active' : ''}`}
                onClick={() => {
                  setItemType('sample');
                  setSelectedMintType(null);
                }}
              >
                <span className="type-icon">🎵</span>
                <span className="type-label">Music Sample</span>
              </button>
              <button
                type="button"
                className={`item-type-btn ${itemType === 'pack' ? 'active' : ''}`}
                onClick={() => {
                  setItemType('pack');
                  setSelectedMintType(null);
                }}
              >
                <span className="type-icon">📦</span>
                <span className="type-label">Sample Pack</span>
              </button>
            </div>
          </div>

          {/* Step 2: Item Details */}
          <div className="form-section">
            <h2 className="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Step 2: Item Details
            </h2>

            {/* Image Upload */}
            <div className="form-group">
              <label>Item Image *</label>
              {itemImagePreview ? (
                <div className="image-preview-card">
                  <img src={itemImagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="change-image-btn"
                    onClick={() => {
                      setItemImage(null);
                      setItemImagePreview('');
                    }}
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <label className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                    required
                  />
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Upload item image</span>
                </label>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Item Name *</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Classic Hoodie or Bass Loop"
                  required
                />
              </div>

              <div className="form-group">
                <label>Base Price (USD) *</label>
                <div className="price-input">
                  <span className="currency">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="29.99"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Item Description *</label>
              <textarea
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder="Describe your item..."
                rows={4}
                required
              />
            </div>
          </div>

          {/* Step 3: Select Mint Type */}
          <div className="form-section">
            <h2 className="section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Step 3: Select NFT Mint Type
            </h2>

            <div className="mint-types-grid">
              {getCurrentMintTypes().map((type) => (
                <div
                  key={type.id}
                  className={`mint-type-card ${selectedMintType === type.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMintType(type.id)}
                >
                  <div className="mint-type-header">
                    <span className="mint-type-icon">{type.icon}</span>
                    <h3>{type.name}</h3>
                  </div>
                  <p className="mint-type-description">{type.description}</p>
                  <div className="mint-type-features">
                    {type.features.map((feature, idx) => (
                      <span key={idx} className="feature-tag">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </span>
                    ))}
                  </div>
                  {selectedMintType === type.id && (
                    <div className="selected-indicator">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Mint Configuration */}
          {selectedMintType && (
            <div className="form-section mint-config-section">
              <h2 className="section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Step 4: Configure Mint
              </h2>

              <div className="form-row">
                <div className="form-group">
                  <label>NFT Mint Price (ETH) *</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={mintPrice}
                    onChange={(e) => setMintPrice(e.target.value)}
                    placeholder="0.05"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Total Supply *</label>
                  <input
                    type="number"
                    min="1"
                    value={totalSupply}
                    onChange={(e) => setTotalSupply(e.target.value)}
                    placeholder="100"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Royalty % *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={royaltyPercentage}
                    onChange={(e) => setRoyaltyPercentage(e.target.value)}
                    placeholder="5"
                    required
                  />
                </div>
              </div>

              {/* Type-specific configuration */}
              {selectedMintType === 'loyalty-discount' && (
                <div className="form-group">
                  <label>Discount Percentage *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    placeholder="10"
                    required
                  />
                  <small>Perpetual discount on future purchases</small>
                </div>
              )}

              {selectedMintType === 'dynamic-value' && (
                <div className="form-group">
                  <label>Dynamic Price Multiplier *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={dynamicPriceMultiplier}
                    onChange={(e) => setDynamicPriceMultiplier(e.target.value)}
                    placeholder="1.5"
                    required
                  />
                  <small>Price multiplier when triggers activate</small>
                </div>
              )}

              {selectedMintType === 'upgradeable' && (
                <div className="form-group">
                  <label>Upgrade Price (ETH) *</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={upgradePrice}
                    onChange={(e) => setUpgradePrice(e.target.value)}
                    placeholder="0.03"
                    required
                  />
                  <small>Cost to upgrade from Personal to Commercial</small>
                </div>
              )}

              {selectedMintType === 'access-unlock' && (
                <div className="form-group">
                  <label>Access Duration (days) *</label>
                  <input
                    type="number"
                    min="1"
                    value={accessDuration}
                    onChange={(e) => setAccessDuration(e.target.value)}
                    placeholder="365"
                    required
                  />
                  <small>Duration of access (0 for lifetime)</small>
                </div>
              )}

              {(selectedMintType === 'cross-utility-sample' || selectedMintType === 'cross-utility-clothing') && (
                <div className="cross-utility-config">
                  <label>Cross-Utility Perks</label>
                  {crossUtilityPerks.map((perk, index) => (
                    <div key={index} className="perk-item">
                      <select
                        value={perk.type}
                        onChange={(e) => updatePerk(index, 'type', e.target.value)}
                      >
                        <option value="free-sample">Free Sample</option>
                        <option value="discount-code">Discount Code</option>
                        <option value="free-item">Free Item</option>
                        <option value="early-access">Early Access</option>
                      </select>
                      <input
                        type="text"
                        value={perk.value}
                        onChange={(e) => updatePerk(index, 'value', e.target.value)}
                        placeholder="Perk value/details"
                      />
                      <button
                        type="button"
                        className="remove-perk-btn"
                        onClick={() => removePerk(index)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-perk-btn"
                    onClick={addCrossUtilityPerk}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Perk
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn-create-mint"
            disabled={!selectedMintType || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                Creating NFT Mint...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Create NFT Mint
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMintToItem;
// src/components/PackForm/PackFormHeader.tsx
import React from 'react';

interface PackFormHeaderProps {
  mode: 'upload' | 'edit';
  title: string;
  subtitle: string;
}

export const PackFormHeader: React.FC<PackFormHeaderProps> = ({ 
  mode, 
  title, 
  subtitle 
}) => (
  <header className="form-header">
    <h1 className="form-title">
      {title} <span className="gradient-text">{mode === 'upload' ? 'Pack' : ''}</span>
    </h1>
    <p className="form-subtitle">{subtitle}</p>
  </header>
);
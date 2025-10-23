// src/types/index.ts

export interface Sample {
  id: number;
  name: string;
  duration: string;
  bpm?: number;
  key?: string;
  genre: string;
  audioUrl: string;
  waveformUrl?: string;
}

export interface SamplePack {
  id: number;
  title: string;
  artist: string;
  coverImage: string;
  price: number;
  sampleCount: number;
  totalSize: string;
  description: string;
  genres: string[];
  tags: string[];
  samples: Sample[];
  rating?: number;
  downloads?: number;
  releaseDate?: string;
}

export interface CartItem {
  packId: number;
  pack: SamplePack;
  quantity: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  likedPacks: number[];
  purchasedPacks: number[];
}
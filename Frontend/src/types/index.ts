// src/types/index.ts

export interface AudioSample {
  id: string;
  name: string;
  audioUrl: string;
  duration?: number;
  artist?: string;
  bpm?: number;
  key?: string;
  genre?: string;
  price?: number;
  packId?: number;
  instrument?: string;
  sampleType?: string; // loop or oneshot
}

export interface SamplePack {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  price: number;
  sampleCount: number;
  totalSize: string;
  description: string;
  genres: string[];
  tags: string[];
  samples: SamplesFromPackDTO[];
  rating?: number;
  downloads?: number;
  releaseDate?: string;
  isLoggedUserPack?: boolean;
}

export type SamplesFromPackDTO = {
  id: string;
  name: string;
  duration: number;
  bpm?: number;
  key?: string;
  scale?: string;
  genre?: string;
  instrumentGroup?: string;
  sampleType: "LOOP" | "ONESHOT";
  audioUrl: string;
  packName?: string;
  packId?: string;
  artist: string;
  price: number;
  authorId: string;
  tags: string[];
};


export interface CartItem {
  packId: string;
  pack: SamplePack;
  quantity: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  likedPacks: number[];
  purchasedPacks: number[];
}
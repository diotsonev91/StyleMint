// src/types/index.ts

export interface AudioSample {
    id: string; // UUID in Spring maps to string in TypeScript
    name: string;
    authorId: string; // UUID in Spring
    artist?: string;
    audioUrl: string;
    duration?: number;
    bpm?: number;
    key?: string; // Assuming MusicalKey enum maps to string
    scale?: string; // Assuming MusicalScale enum maps to string
    genre?: string; // Assuming Genre enum maps to string
    instrumentGroup?: string; // Assuming InstrumentGroup enum maps to string
    sampleType?: string; // Assuming SampleType enum maps to string
    price?: number;
    packId?: string; // UUID in Spring
    packTitle?: string;
    createdAt: string; // OffsetDateTime maps to ISO string
    updatedAt: string; // OffsetDateTime maps to ISO string
    tags: string[];
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
  samples: AudioSample[];
  rating?: number;
  downloads?: number;
  releaseDate?: string;
  isLoggedUserPack?: boolean;
}


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
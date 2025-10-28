// CartItemState.ts - Extended with samples and packs support
import { proxy } from "valtio";

// Base cart item (common fields)
type BaseCartItem = {
  id: string;
  quantity?: number; // Optional, defaults to 1
};

// Clothes-specific cart item
export type ClothesCartItem = BaseCartItem & {
  type: 'clothes';
  selectedColor: string;
  selectedDecal: string;
  selected_type: string;
  decalPosition: [number, number, number] | null;
  rotationY: number;
  ripples: { id: number; pos: [number, number, number] }[];
};

// Sample-specific cart item
export type SampleCartItem = BaseCartItem & {
  type: 'sample';
  name: string;
  price: number;
  artist?: string;
  coverImage?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  duration?: number;
  url?: string;
  tags?: string[];
};

// Pack-specific cart item
export type PackCartItem = BaseCartItem & {
  type: 'pack';
  name: string;
  price: number;
  artist?: string;
  coverImage?: string;
  description?: string;
  genres?: string[];
  tags?: string[];
  sampleCount?: number;
  samples?: Array<{
    id: string;
    name: string;
    bpm?: number;
    key?: string;
  }>;
};

// Discriminated union - TypeScript can distinguish which type based on 'type' field
export type CartItemState = ClothesCartItem | SampleCartItem | PackCartItem;

// Cart state structure
type CartState = {
  items: CartItemState[];
  purchaseHistory: CartItemState[];
};

// --------- SINGLETON PATTERN ---------
const SINGLETON_KEY = '__CART_STATE_SINGLETON__';
const g = globalThis as any;

if (!g[SINGLETON_KEY]) {
  console.log("🟢 Creating NEW cartState singleton");
  g[SINGLETON_KEY] = proxy<CartState>({
    items: [],
    purchaseHistory: [],
  });
  
  Object.defineProperty(g, SINGLETON_KEY, {
    value: g[SINGLETON_KEY],
    writable: false,
    configurable: false,
  });
} else {
  console.log("🟡 Using EXISTING cartState singleton");
}

export const cartState = g[SINGLETON_KEY] as CartState;

// Make globally accessible for debugging
if (typeof window !== 'undefined') {
  (window as any).__cartState = cartState;
}
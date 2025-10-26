// CartItemState.ts - Updated with quantity support
import { proxy } from "valtio";

export type CartItemState = {
  id: string;
  selectedColor: string;
  selectedDecal: string;
  selected_type: string;
  decalPosition: [number, number, number] | null;
  rotationY: number;
  ripples: { id: number; pos: [number, number, number] }[];
  quantity?: number; // ✅ Added quantity field (optional, defaults to 1)
};

// --------- SINGLETON PATTERN ---------
const SINGLETON_KEY = '__CART_STATE_SINGLETON__';
const g = globalThis as any;

if (!g[SINGLETON_KEY]) {
  console.log("🟢 Creating NEW cartState singleton");
  g[SINGLETON_KEY] = proxy({
    items: [] as CartItemState[],
  });
  
  Object.defineProperty(g, SINGLETON_KEY, {
    value: g[SINGLETON_KEY],
    writable: false,
    configurable: false,
  });
} else {
  console.log("🟡 Using EXISTING cartState singleton");
}

export const cartState = g[SINGLETON_KEY];

// Make globally accessible for debugging
if (typeof window !== 'undefined') {
  (window as any).__cartState = cartState;
}
// CartService.ts - Updated with proper pack handling
import { cartState, state } from "../state";
import type { ClothesCartItem, SampleCartItem, PackCartItem, CartItemState } from "../state";
import type { SamplePack, SamplesFromPackDTO } from "../types";
import { subscribe } from "valtio";
import { fetchCartFromBackend } from "../api/cart";

const CART_STORAGE_KEY = "sample-marketplace-cart";

// storage helpers (cart only)
export function loadFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      cartState.items = JSON.parse(savedCart);
    }
  } catch {
    // ignore
  }
}

export function saveToStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState.items));
  } catch {
    // ignore
  }
}

// auto-load on import + auto-save on change
if (typeof window !== "undefined") {
  loadFromStorage();
  subscribe(cartState, () => {
    saveToStorage();
  });
}

// existing – add clothes
export async function addClothToCart() {
  const item: ClothesCartItem = {
    id: crypto.randomUUID(),
    type: "clothes",
    selectedColor: state.selectedColor,
    selectedDecal: state.selectedDecal,
    selected_type: state.selected_type,
    decalPosition: state.decalPosition,
    rotationY: state.rotationY,
    ripples: state.ripples.slice(),
    quantity: 1,
  };

  cartState.items.push(item);
}

// existing – refresh from backend
export async function refreshCart() {
  try {
    const items = await fetchCartFromBackend();
    cartState.items = items as CartItemState[];
  } catch (e) {
    console.error("Failed to refresh cart", e);
  }
}

// existing – update qty (mainly clothes)
export function updateItemQuantity(itemId: string, quantity: number) {
  const idx = cartState.items.findIndex((it) => it.id === itemId);
  if (idx !== -1) {
    const q = Math.max(1, quantity);
    (cartState.items[idx] as any).quantity = q;
  }
}

// existing – total item count (with quantities)
export function getTotalItemCount(): number {
  return cartState.items.reduce((total, item) => total + ((item as any).quantity || 1), 0);
}

// new – add sample (once, qty=1)
export function addSampleToCart(item: Omit<SampleCartItem, "type" | "quantity">) {
  const exists = cartState.items.some((i) => i.id === item.id && i.type === "sample");
  if (exists) return;

  const sampleItem: SampleCartItem = {
    ...item,
    type: "sample",
    quantity: 1,
  };
  cartState.items.push(sampleItem);
}

// ✅ UPDATED – add pack with all its samples
export function addPackToCart(packData: Omit<PackCartItem, "type" | "quantity">, samples?: SamplesFromPackDTO[]) {
  // Check if pack already exists in cart
  const packExists = cartState.items.some((i) => i.id === packData.id && i.type === "pack");
  if (packExists) {
    console.log(`Pack ${packData.id} is already in cart`);
    return;
  }

  // Add the pack itself
  const packItem: PackCartItem = {
    ...packData,
    type: "pack",
    quantity: 1,
  };
  cartState.items.push(packItem);
  console.log(`✅ Added pack ${packData.name} to cart`);

  // ✅ Add all samples from the pack
  if (samples && samples.length > 0) {
    let addedCount = 0;
    samples.forEach((sample) => {
      // Only add if not already in cart
      const sampleExists = cartState.items.some(
        (i) => i.id === sample.id && i.type === "sample"
      );
      
      if (!sampleExists) {
        const sampleItem: SampleCartItem = {
          id: sample.id,
          type: "sample",
          name: sample.name,
          price: sample.price,
          artist: sample.artist,
          coverImage: undefined, // Samples don't typically have individual cover images
          genre: sample.genre,
          bpm: sample.bpm,
          key: sample.key,
          duration: sample.duration,
          url: sample.audioUrl,
          tags: [], // You can add tags if needed
          quantity: 1,
        };
        cartState.items.push(sampleItem);
        addedCount++;
      }
    });
    console.log(`✅ Added ${addedCount}/${samples.length} samples from pack to cart`);
  } else {
    console.warn(`⚠️ Pack ${packData.name} has no samples to add`);
  }
}

// ✅ NEW – Add pack from SamplePack type (convenience function)
export function addSamplePackToCart(pack: SamplePack) {
  const packData: Omit<PackCartItem, "type" | "quantity"> = {
    id: pack.id,
    name: pack.title,
    price: pack.price,
    artist: pack.artist,
    coverImage: pack.coverImage,
    description: pack.description,
    genres: pack.genres,
    tags: pack.tags,
    sampleCount: pack.sampleCount,
    samples: pack.samples.map(s => ({
      id: s.id,
      name: s.name,
      bpm: s.bpm,
      key: s.key,
    })),
  };

  // Add pack and all its samples
  addPackToCart(packData, pack.samples);
}

// new – remove by id (first match, any type)
export function removeItem(id: string) {
  const idx = cartState.items.findIndex((i) => i.id === id);
  if (idx !== -1) {
    cartState.items.splice(idx, 1);
  }
}

// ✅ NEW – Remove pack and optionally remove its samples
export function removePackFromCart(packId: string, removeSamples: boolean = false) {
  // Find and remove the pack
  const packIdx = cartState.items.findIndex(
    (i) => i.id === packId && i.type === "pack"
  );
  
  if (packIdx === -1) {
    console.warn(`Pack ${packId} not found in cart`);
    return;
  }

  const pack = cartState.items[packIdx] as PackCartItem;
  cartState.items.splice(packIdx, 1);
  console.log(`✅ Removed pack ${pack.name} from cart`);

  // Optionally remove associated samples
  if (removeSamples && pack.samples) {
    const sampleIds = pack.samples.map(s => s.id);
    const initialCount = cartState.items.length;
    
    cartState.items = cartState.items.filter(
      (item) => !(item.type === "sample" && sampleIds.includes(item.id))
    );
    
    const removedCount = initialCount - cartState.items.length;
    console.log(`✅ Removed ${removedCount} associated samples from cart`);
  }
}

// new – clear cart
export function clearCart() {
  cartState.items = [];
}

// new – check presence
export function isInCart(id: string, type?: CartItemState["type"]): boolean {
  return cartState.items.some((item) => item.id === id && (!type || item.type === type));
}

// ✅ NEW – Check if pack is in cart (checks pack itself, not individual samples)
export function isPackInCart(packId: string): boolean {
  return cartState.items.some((item) => item.id === packId && item.type === "pack");
}

// ✅ NEW – Check if sample is in cart (either standalone or part of a pack)
export function isSampleInCart(sampleId: string): boolean {
  return cartState.items.some((item) => item.id === sampleId && item.type === "sample");
}

// new – getters by type
export function getItemsByType(type: CartItemState["type"]): CartItemState[] {
  return cartState.items.filter((i) => i.type === type);
}

export function getClothesItems(): ClothesCartItem[] {
  return cartState.items.filter((i) => i.type === "clothes") as ClothesCartItem[];
}

export function getSampleItems(): SampleCartItem[] {
  return cartState.items.filter((i) => i.type === "sample") as SampleCartItem[];
}

export function getPackItems(): PackCartItem[] {
  return cartState.items.filter((i) => i.type === "pack") as PackCartItem[];
}

// new – totals (samples & packs only; price fallback 0)
export function getTotals() {
  const subtotal = cartState.items.reduce((sum, item) => {
    if (item.type === "sample" || item.type === "pack") {
      const price = (item as any).price ?? 0;
      const qty = (item as any).quantity || 1;
      return sum + price * qty;
    }
    return sum;
  }, 0);

  const taxRate = 0;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  const itemCount = cartState.items.reduce((sum, item) => sum + ((item as any).quantity || 1), 0);

  return { subtotal, tax, total, itemCount };
}

// new – validate (no price validation per choice)
export function validateCart() {
  const errors: string[] = [];

  if (cartState.items.length === 0) {
    errors.push("Cart is empty");
  }

  cartState.items.forEach((item) => {
    if (item.type === "clothes") {
      const it = item as ClothesCartItem;
      if (!it.selectedColor || !it.selected_type) {
        errors.push(`Incomplete clothes configuration: ${it.id}`);
      }
    }
  });

  return { valid: errors.length === 0, errors };
}

// new – format price
export function formatPrice(price: number): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
  } catch {
    return `$${price.toFixed(2)}`;
  }
}

// ✅ NEW – Get cart summary
export function getCartSummary() {
  const packs = getPackItems();
  const samples = getSampleItems();
  const clothes = getClothesItems();
  const totals = getTotals();

  return {
    packCount: packs.length,
    sampleCount: samples.length,
    clothesCount: clothes.length,
    totalItems: cartState.items.length,
    ...totals,
  };
}
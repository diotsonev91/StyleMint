// CartService.ts - Updated to initialize quantity
import { cartState, state } from "../state";

import { fetchCartFromBackend } from "../api/cart";

export async function addToCart() {
  const item = {
    id: crypto.randomUUID(),
    selectedColor: state.selectedColor,
    selectedDecal: state.selectedDecal,
    selected_type: state.selected_type,
    decalPosition: state.decalPosition,
    rotationY: state.rotationY,
    ripples: state.ripples.slice(),
    quantity: 1, // ✅ Initialize quantity to 1
  };

  console.log("📦 Adding item to cart:", item);
  console.log("🛒 Cart BEFORE push:", cartState.items.length);

  // Add to cart
  cartState.items.push(item);

  console.log("🛒 Cart AFTER push:", cartState.items.length);
  console.log("✅ Item added successfully");

  // Send to backend (commented out for now)
  try {
    // await postCartItem(item);
    console.log("✅ (Backend call skipped)");
  } catch (err) {
    console.error("❌ Failed to sync with backend:", err);
  }
}

export async function refreshCart() {
  try {
    const items = await fetchCartFromBackend();
    cartState.items = items;
    console.log("🔄 Cart refreshed from backend:", items.length, "items");
  } catch (e) {
    console.error("❌ Failed to refresh cart", e);
  }
}

// ✅ Helper function to update item quantity
export function updateItemQuantity(itemId: string, quantity: number) {
  const itemIndex = cartState.items.findIndex(item => item.id === itemId);
  if (itemIndex !== -1) {
    (cartState.items[itemIndex] as any).quantity = Math.max(1, quantity);
    console.log(`📝 Updated item ${itemId} quantity to ${quantity}`);
  }
}

// ✅ Helper function to get total item count
export function getTotalItemCount(): number {
  return cartState.items.reduce((total, item) => {
    return total + ((item as any).quantity || 1);
  }, 0);
}
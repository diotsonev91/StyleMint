
import type { CartItemState } from "../state";

const BASE = "http://localhost:8080";

export async function fetchCartFromBackend(): Promise<CartItemState[]> {
  const res = await fetch(`${BASE}/api/cart`);
  if (!res.ok) throw new Error("Cart fetch failed");
  return res.json();
}

 
export async function postCartItem(item: any) {
  const res = await fetch("http://localhost:8080/api/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  if (!res.ok) {
    throw new Error("Failed to add cart item");
  }

  return await res.json();
} 

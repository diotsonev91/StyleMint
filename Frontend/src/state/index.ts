// state/index.ts
// ⚠️ IMPORTANT: Import all state from this file to avoid multiple instances

export { cartState } from "./CartItemState";
export type { CartItemState } from "./CartItemState";
export { state } from "./Store";
export type {
  ClothesCartItem,
  SampleCartItem,
  PackCartItem,
} from "./CartItemState";

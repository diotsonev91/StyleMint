// CartItemState.ts - Valtio-compatible version
import { proxy } from "valtio";

// Base cart item (common fields)
type BaseCartItem = {
    readonly id: string;
    readonly quantity?: number; // Optional, defaults to 1
};

// Clothes-specific cart item
export type ClothesCartItem = BaseCartItem & {
    readonly type: "clothes";
    readonly selectedColor: string;
    readonly selectedDecal: string;
    readonly selected_type: string;

    // Valtio snapshot ALWAYS returns readonly tuple.
    readonly decalPosition: readonly [number, number, number] | null;

    readonly rotationY: number;

    // Valtio returns readonly arrays and readonly tuples internally.
    readonly ripples: readonly {
        readonly id: number;
        readonly pos: readonly [number, number, number];
    }[];
};

// Sample-specific cart item
export type SampleCartItem = BaseCartItem & {
    readonly type: "sample";
    readonly name: string;
    readonly price: number;
    readonly artist?: string;
    readonly coverImage?: string;
    readonly genre?: string;
    readonly bpm?: number;
    readonly key?: string;
    readonly duration?: number;
    readonly url?: string;
    readonly tags?: readonly string[];
};

// Pack-specific cart item
export type PackCartItem = BaseCartItem & {
    readonly type: "pack";
    readonly name: string;
    readonly price: number;
    readonly artist?: string;
    readonly coverImage?: string;
    readonly description?: string;
    readonly genres?: readonly string[];
    readonly tags?: readonly string[];
    readonly sampleCount?: number;
    readonly samples?: readonly {
        readonly id: string;
        readonly name: string;
        readonly bpm?: number;
        readonly key?: string;
    }[];
};

// Discriminated union
export type CartItemState = ClothesCartItem | SampleCartItem | PackCartItem;

// Cart state structure
type CartState = {
    items: CartItemState[];
    purchaseHistory: CartItemState[];
};

// --------- SINGLETON PATTERN ---------
const SINGLETON_KEY = "__CART_STATE_SINGLETON__";
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

// Make debug visible in browser
if (typeof window !== "undefined") {
    (window as any).__cartState = cartState;
}

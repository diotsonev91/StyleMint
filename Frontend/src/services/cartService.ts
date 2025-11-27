// cartService.ts - Updated with order integration
import { cartState, state } from "../state";
import type { ClothesCartItem, SampleCartItem, PackCartItem, CartItemState } from "../state/CartItemState";
import type { AudioSample, SamplePack } from "../types";
import { subscribe } from "valtio";
import {DesignDetailDTO} from "../api/clothDesign.api";
import { clothDesignApi } from "../api/clothDesign.api";




import {cartApi, mapCartItemToOrderItem} from "../api/cart.api";

const CART_STORAGE_KEY = "sample-marketplace-cart";

// ========================================
// STORAGE HELPERS (localStorage)
// ========================================

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

/**
 * Fetch price for a single cart item (server-side accurate)
 */
export async function fetchItemPrice(item: CartItemState): Promise<number> {
    try {
        const orderItem = mapCartItemToOrderItem(item);
        const response = await cartApi.getItemPrice(orderItem);
        const price = response.data;

        // 🔥 Save price directly inside the item
        (item as any).price = price;

        return price;
    } catch (err) {
        console.error("❌ Failed to load price for item", item, err);
        return 0;
    }
}


// Auto-load on import + auto-save on change
if (typeof window !== "undefined") {
    loadFromStorage();
    subscribe(cartState, () => {
        saveToStorage();
    });
}

// ========================================
// CART OPERATIONS
// ========================================

/**
 * ⭐⭐⭐ Add clothes to cart - TWO MODES ⭐⭐⭐
 *
 * Mode 1: From saved design (design parameter provided)
 * Mode 2: From basic editor (no design, use current state)
 */
export async function addClothToCart(design?: DesignDetailDTO) {

    // ⭐ MODE 1: Adding from saved design
    if (design) {
        console.log("📦 Adding saved design to cart:", design.id);

        const customization = design.customizationData;

        // Custom decal priority: state.customDecal > design.customDecalUrl
        const customDecalUrl =
            state.customDecal?.previewUrl ??
            design.customDecalUrl ??
            null;

        const item: ClothesCartItem = {
            id: design.id, // Use design ID
            type: "clothes",
            selectedColor: customization.selectedColor,
            selectedDecal: customization.selectedDecal,
            selected_type: design.clothType.toLowerCase(),
            decalPosition: customization.decalPosition,
            rotationY: customization.rotationY,
            ripples: [],
            quantity: 1,
            hasCustomDecal: !!customDecalUrl,
            customDecalUrl: customDecalUrl,
        };

        cartState.items.push(item);
        console.log("✅ Added saved design to cart");
        return item;
    }

    // ============================
    // MODE 2: Basic Editor (AUTO-SAVE)
    // ============================
    console.log("📦 Adding basic customization to cart (AUTO-SAVE enabled)");

    // Validate
    if (!state.selectedColor || !state.selectedDecal || !state.selected_type) {
        throw new Error("Please select color, decal, and type before adding to cart");
    }

    // 🔥 Create FormData for backend (same as createDesign)
    const formData = new FormData();
    formData.append("label", "My Design " + Date.now());
    formData.append("clothType", state.selected_type.toUpperCase());
    formData.append("customizationType", "SIMPLE");

    // FULL JSON
    formData.append("customizationJson", JSON.stringify({
        selectedColor: state.selectedColor,
        selectedDecal: state.selectedDecal,
        decalPosition: state.decalPosition,
        rotationY: state.rotationY,
        ripples: state.ripples,
    }));

    // Custom decal file
    if (state.customDecal?.file) {
        formData.append("customDecalFile", state.customDecal.file);
    }

    // 🔥 CALL BACKEND
    const response = await clothDesignApi.autoSaveDesign(formData);
    const saved = response.data.data;

    // BACKEND RETURNS REAL designId
    const item: ClothesCartItem = {
        id: saved.id,
        type: "clothes",
        selectedColor: state.selectedColor,
        selectedDecal: state.selectedDecal,
        selected_type: state.selected_type,
        decalPosition: state.decalPosition,
        rotationY: state.rotationY,
        ripples: state.ripples,
        quantity: 1,
        hasCustomDecal: !!saved.customDecalUrl,
        customDecalUrl: saved.customDecalUrl,
    };

    cartState.items.push(item);
    console.log("✅ AUTO-SAVED and added to cart", saved.id);

    return item;
}

/**
 * Add sample to cart (once, qty=1)
 */
export function addSampleToCart(item: Omit<SampleCartItem, "type" | "quantity">) {
    const exists = cartState.items.some((i) => i.id === item.id && i.type === "sample");
    if (exists) {
        console.log(`Sample ${item.id} already in cart`);
        return;
    }

    const sampleItem: SampleCartItem = {
        ...item,
        type: "sample",
        quantity: 1,
    };
    cartState.items.push(sampleItem);
    console.log('✅ Added sample to cart:', item.name);
}

/**
 * Add pack with all its samples
 */
export function addPackToCart(packData: Omit<PackCartItem, "type" | "quantity">, samples?: AudioSample[]) {
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
}

/**
 * Add pack from SamplePack type (convenience function)
 */
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

    addPackToCart(packData, pack.samples);
}

/**
 * Update item quantity
 */
export function updateItemQuantity(itemId: string, quantity: number) {
    const idx = cartState.items.findIndex((it) => it.id === itemId);
    if (idx !== -1) {
        const q = Math.max(1, quantity);
        (cartState.items[idx] as any).quantity = q;
        console.log(`Updated quantity for ${itemId}: ${q}`);
    }
}

/**
 * Remove item by id
 */
export function removeItem(id: string) {
    const idx = cartState.items.findIndex((i) => i.id === id);
    if (idx !== -1) {
        const item = cartState.items[idx];
        cartState.items.splice(idx, 1);
        console.log(`✅ Removed ${item.type} from cart: ${id}`);
    }
}

/**
 * Remove pack and optionally remove its samples
 */
export function removePackFromCart(packId: string, removeSamples: boolean = false) {
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

/**
 * Clear cart
 */
export function clearCart() {
    cartState.items = [];
    console.log('🗑️ Cart cleared');
}

// ========================================
// QUERY HELPERS
// ========================================

/**
 * Check if item is in cart
 */
export function isInCart(id: string, type?: CartItemState["type"]): boolean {
    return cartState.items.some((item) => item.id === id && (!type || item.type === type));
}

/**
 * Check if pack is in cart
 */
export function isPackInCart(packId: string): boolean {
    return cartState.items.some((item) => item.id === packId && item.type === "pack");
}

/**
 * Check if sample is in cart
 */
export function isSampleInCart(sampleId: string): boolean {
    return cartState.items.some((item) => item.id === sampleId && item.type === "sample");
}

/**
 * Get items by type
 */
export function getItemsByType(type: CartItemState["type"]): CartItemState[] {
    return cartState.items.filter((i) => i.type === type);
}

/**
 * Get clothes items
 */
export function getClothesItems(): ClothesCartItem[] {
    return cartState.items.filter((i) => i.type === "clothes") as ClothesCartItem[];
}

/**
 * Get sample items
 */
export function getSampleItems(): SampleCartItem[] {
    return cartState.items.filter((i) => i.type === "sample") as SampleCartItem[];
}

/**
 * Get pack items
 */
export function getPackItems(): PackCartItem[] {
    return cartState.items.filter((i) => i.type === "pack") as PackCartItem[];
}

/**
 * Get total item count (with quantities)
 */
export function getTotalItemCount(): number {
    return cartState.items.reduce((total, item) => total + ((item as any).quantity || 1), 0);
}

// ========================================
// TOTALS & PRICING
// ========================================

/**
 * Calculate cart totals (client-side estimate)
 *
 * IMPORTANT: These are ESTIMATES only!
 * Real prices with discounts are calculated server-side.
 * Use orderService.previewOrderTotal() for accurate totals.
 */
export function getTotals() {
    const subtotal = cartState.items.reduce((sum, item) => {
        if (item.type === "sample" || item.type === "pack") {
            const price = (item as any).price ?? 0;
            const qty = (item as any).quantity || 1;
            return sum + price * qty;
        }
        // Clothes prices are calculated server-side
        return sum;
    }, 0);

    const taxRate = 0;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    const itemCount = cartState.items.reduce((sum, item) => sum + ((item as any).quantity || 1), 0);

    return { subtotal, tax, total, itemCount };
}

/**
 * Get cart summary
 */
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

// ========================================
// VALIDATION
// ========================================

/**
 * Validate cart before checkout
 */
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

/**
 * Check if cart has physical items (requires delivery address)
 */
export function hasPhysicalItems(): boolean {
    return cartState.items.some(item => item.type === "clothes");
}

/**
 * Check if cart has digital items (requires Stripe)
 */
export function hasDigitalItems(): boolean {
    return cartState.items.some(item => item.type === "sample" || item.type === "pack");
}

// ========================================
// FORMATTING
// ========================================

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
    try {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
    } catch {
        return `$${price.toFixed(2)}`;
    }
}

/**
 * Format price in EUR
 */
export function formatPriceEUR(price: number): string {
    try {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(price);
    } catch {
        return `€${price.toFixed(2)}`;
    }
}
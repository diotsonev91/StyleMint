// state/Store.ts - FIXED with ref() for File objects
import { proxy, ref } from "valtio";

// ✅ FIX: Use ref() to prevent File objects from being proxied
// ref() tells Valtio to NOT wrap this object in a proxy
const state = proxy({
    page: "intro" as "intro" | "basic" | "advanced",
    colors: ["#ccc", "#EFBD4E", "#80C670", "#726DE8", "#EF674E", "#353934"],
    decals: ["react", "three2", "pmndrs", "style_mint", "patata", "linux", "dyno"],
    selectedColor: "#EFBD4E",
    selectedDecal: "style_mint",
    types: ["t_shirt_sport", "t_shirt_classic", "cap", "hoodie"],
    selected_type: "t_shirt_sport",
    decalPosition: null as [number, number, number] | null,
    rotationY: 0 as number,
    ripples: [] as { id: number; pos: [number, number, number] }[],

    // ✅ CRITICAL: File objects MUST be wrapped with ref()
    // This prevents Valtio from proxying the File object
    customDecal: null as { file: File; previewUrl: string } | null,

    userDesigns: [] as any[],
});

export { state };
import { useFrame } from "@react-three/fiber";
import { useSnapshot } from "valtio";
import { state } from "../../../state";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import type { ClothesCartItem } from "../../../state";
import { useState } from "react";

type HoodieProps = {
    advanced?: boolean;
    cartItem?: ClothesCartItem;
    rotationYOverride?: number;
};

export function Hoodie({ advanced, cartItem, rotationYOverride }: HoodieProps) {
    const { nodes, materials } = useGLTF("/models/hoodie_test.glb") as any;

    // ----------- PICK SOURCE (cart/static vs editor) -----------
    const snap = useSnapshot(state);
    const usedColor = cartItem ? cartItem.selectedColor : snap.selectedColor;
    const usedDecal = cartItem ? cartItem.selectedDecal : snap.selectedDecal;

    const usedPos = cartItem
        ? cartItem.decalPosition ?? [-0.0, 0.1, -0.15]
        : snap.decalPosition ?? [-0.0, 0.1, -0.15];

    const usedRotY = cartItem
        ? (rotationYOverride ?? cartItem.rotationY)
        : snap.rotationY;

    // ----------- MATERIAL ISOLATION -----------
    const baseMat = materials["Material238904.005"];
    const [localMat] = useState(() => baseMat.clone());

    // ----------- COLOR UPDATE -----------
    useFrame((_, d) => {
        const target = new THREE.Color(usedColor);

        if (cartItem) {
            localMat.color.copy(target); // static
        } else {
            easing.dampC(localMat.color, target, 0.25, d); // smooth
        }
    });

    // ----------- DECAL TEXTURE LOGIC (FULL FIXED) -----------
    let texturePath: string;

    if (usedDecal === "custom") {
        if (cartItem?.customDecalUrl) {
            texturePath = cartItem.customDecalUrl;
        } else if (snap.customDecal?.previewUrl) {
            texturePath = snap.customDecal.previewUrl;
        } else {
            console.warn("⚠ custom decal selected but no URL available");
            texturePath = "/images/default_fallback.png"; // must exist in public/images
        }
    } else {
        texturePath = `/images/${usedDecal}_thumb.png`;
    }

    const texture = useTexture(texturePath);
    texture.anisotropy = 16;

    return (
        <group
            rotation={[Math.PI / 2, 0, (usedRotY * Math.PI) / 180]}
            scale={0.78}
            position={[0.3, 0.09, 0]}
        >
            <mesh geometry={nodes.Object_2.geometry} material={localMat}>
                <Decal
                    position={usedPos}
                    rotation={[-Math.PI / 1.7, -Math.PI * 0.2, 0]}
                    scale={0.12}
                    map={texture}
                    depthTest
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
}

// src/components/three/models/Shirt.tsx
import { useFrame } from "@react-three/fiber";
import { useSnapshot } from "valtio";
import { state } from "../../../state";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import type { ClothesCartItem } from "../../../state";
import { useState } from "react";

type ShirtProps = {
  variant: "sport" | "classic";
  advanced?: boolean;
  cartItem?: ClothesCartItem;
  rotationYOverride?: number;
};

export function Shirt({ 
  variant, 
  advanced, 
  cartItem, 
  rotationYOverride,
  ...props 
}: ShirtProps) {
  const path =
    variant === "sport"
      ? "/models/shirt_baked.glb"
      : "/models/shirt_classic.glb";
  const { nodes, materials } = useGLTF(path) as any;

  // ----------- PICK SOURCE (cart/static vs editor) -----------
  const snap = useSnapshot(state);
  const usedColor = cartItem ? cartItem.selectedColor : snap.selectedColor;
  const usedDecal = cartItem ? cartItem.selectedDecal : snap.selectedDecal;
  
  const isClassic = variant === "classic";
  
  const defaultDecalPos = isClassic ? [-0.46, 0.1, -0.2] : [-0.435, 0.1, -0.3];
  const usedPos = cartItem
    ? cartItem.decalPosition ?? defaultDecalPos
    : snap.decalPosition ?? defaultDecalPos;

  // rotation: in cart = local override; in editor = global state
  const usedRotY = cartItem
    ? (rotationYOverride ?? cartItem.rotationY)
    : snap.rotationY;

  // ----------- MATERIAL ISOLATION (NO SHARING!!) -----------
  const baseMat =
    materials.lambert1 ??
    materials["Material238904.005"] ??
    Object.values(materials)[0];
  
  // clone once per item instance
  const [localMat] = useState(() => baseMat.clone());

  // ----------- APPLY STATIC COLOR if cart; DAMP if live mode -----------
  useFrame((_, delta) => {
    const target = new THREE.Color(usedColor);
    // In cart → STATIC (jump, no blending)
    if (cartItem) {
      localMat.color.copy(target);
    } else {
      easing.dampC(localMat.color, target, 0.25, delta);
    }
  });

 // ... inside Shirt component:

const texturePath = usedDecal === 'custom' && snap.customDecal 
  ? snap.customDecal.previewUrl 
  : `/images/${usedDecal}_thumb.png`;

const texture = useTexture(texturePath);
texture.anisotropy = 16;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace

  const geometry = isClassic
    ? nodes.Cloth.geometry
    : nodes.T_Shirt_male.geometry;

  const decalScale = isClassic ? 0.09 : 0.12;

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={geometry}
        material={localMat}
        position={[0.419, 0, 0]}
        rotation={[
          Math.PI / 2,                    // X
          (usedRotY * Math.PI) / 180,     // Y from slider or cart
          0                                // Z
        ]}
      >
        <Decal
          debug={advanced}
          position={usedPos}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={decalScale}
          map={texture}
          depthTest
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-0.1}
        />
      </mesh>
    </group>
  );
}
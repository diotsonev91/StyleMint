// src/components/three/models/Shoe.tsx
import { useFrame } from "@react-three/fiber";
import { useSnapshot } from "valtio";
import { state } from "../../../state";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import type { ClothesCartItem } from "../../../state";
import { useState } from "react";

type ShoeProps = {
  advanced?: boolean;
  cartItem?: ClothesCartItem;
  rotationYOverride?: number;
};

export function Shoe({ advanced, cartItem, rotationYOverride, ...props }: ShoeProps) {
  const { nodes, materials } = useGLTF("/models/shoe.glb") as unknown as {
    nodes: any;
    materials: any;
  };

  // ----------- PICK SOURCE (cart/static vs editor) -----------
  const snap = useSnapshot(state);
  const usedColor = cartItem ? cartItem.selectedColor : snap.selectedColor;
  const usedDecal = cartItem ? cartItem.selectedDecal : snap.selectedDecal;
  const usedPos = cartItem
    ? cartItem.decalPosition ?? [0, 0, 0.1]
    : snap.decalPosition ?? [0, 0, 0.1];

  // rotation: in cart = local override; in editor = global state
  const usedRotY = cartItem
    ? (rotationYOverride ?? cartItem.rotationY)
    : snap.rotationY;

  // ----------- MATERIAL ISOLATION (NO SHARING!!) -----------
  const baseMat = materials["Main Body Material"];
  
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

 // ... inside Shoe component, replace texture loading:

    const texturePath =
        usedDecal === "custom"
            ? (cartItem?.customDecalUrl ??
                snap.customDecal?.previewUrl ??
                "/images/custom_thumb.png")
            : `/images/${usedDecal}_thumb.png`;


const texture = useTexture(texturePath);
texture.anisotropy = 16;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace

  return (
    <group 
      {...props} 
      dispose={null} 
      scale={1.2}
      rotation={[
        0,                              // X
        (usedRotY * Math.PI) / 180,     // Y from slider or cart
        0                               // Z
      ]}
    >
      <mesh
        geometry={nodes.Plane040.geometry}
        material={materials["Sole Material"]}
        castShadow
      />
      <mesh
        geometry={nodes.Plane040_1.geometry}
        material={materials["Main Body Material"]}
        castShadow
      />

      <mesh 
        geometry={nodes.Plane040_2.geometry} 
        material={localMat} 
        castShadow
      >
        <Decal
          debug={advanced}
          position={usedPos}
          rotation={[0, 0, 0]}
          scale={0.3}
          map={texture}
          depthTest
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-0.1}
        />
      </mesh>

      <mesh
        geometry={nodes.Plane040_3.geometry}
        material={materials["Insole Material right"]}
        castShadow
      />
    </group>
  );
}
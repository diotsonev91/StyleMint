// src/components/three/models/Cap.tsx
import { useFrame } from "@react-three/fiber";
import { useSnapshot } from "valtio";
import { state } from "../../../state";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import type { ClothesCartItem } from "../../../state";
import { useState } from "react";

type CapProps = {
  advanced?: boolean;
  cartItem?: ClothesCartItem;
  rotationYOverride?: number;
};

export function Cap({ advanced, cartItem, rotationYOverride, ...props }: CapProps) {
  const { nodes, materials } = useGLTF("/models/cap.glb") as unknown as {
    nodes: { [key: string]: THREE.Mesh };
    materials: { [key: string]: THREE.MeshStandardMaterial };
  };

  // ----------- PICK SOURCE (cart/static vs editor) -----------
  const snap = useSnapshot(state);
  const usedColor = cartItem ? cartItem.selectedColor : snap.selectedColor;
  const usedDecal = cartItem ? cartItem.selectedDecal : snap.selectedDecal;
  const usedPos = cartItem
    ? cartItem.decalPosition ?? [0, 0.12, 0.12]
    : snap.decalPosition ?? [0, 0.12, 0.12];

  // rotation: in cart = local override; in editor = global state
  const usedRotY = cartItem
    ? (rotationYOverride ?? cartItem.rotationY)
    : snap.rotationY;

  // ----------- MATERIAL ISOLATION (NO SHARING!!) -----------
  const baseMat = materials["CapMaterial1"] ?? Object.values(materials)[0];
  
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

// ... inside Cap component:

const texturePath = usedDecal === 'custom' && snap.customDecal 
  ? snap.customDecal.previewUrl 
  : `/images/${usedDecal}_thumb.png`;

const texture = useTexture(texturePath);
texture.anisotropy = 16;
texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
texture.encoding = THREE.sRGBEncoding;

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cap001.geometry}
        material={localMat}
        rotation={[
          0,                              // X
          (usedRotY * Math.PI) / 180,     // Y from slider or cart
          0                               // Z
        ]}
        scale={1.5}
      >
        <Decal
          debug={advanced}
          position={usedPos}
          rotation={[0, 0, 0]}
          scale={0.09}
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
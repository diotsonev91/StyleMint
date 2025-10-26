// src/components/three/models/Shirt.tsx
import { useFrame } from "@react-three/fiber";
import { useSnapshot } from "valtio";
import { state } from "../../../state";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";

type ShirtProps = {
  variant: "sport" | "classic";
  advanced?: boolean;
};

export function Shirt({ variant, advanced, ...props }: ShirtProps) {
  const path =
    variant === "sport"
      ? "/models/shirt_baked.glb"
      : "/models/shirt_classic.glb";
  const { nodes, materials } = useGLTF(path) as any;

  const snap = useSnapshot(state);

  const isClassic = variant === "classic";

  const texture = useTexture(`/images/${snap.selectedDecal}_thumb.png`);
  texture.anisotropy = 16;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.encoding = THREE.sRGBEncoding;

  const baseMat =
    materials.lambert1 ??
    materials["Material238904.005"] ??
    Object.values(materials)[0];

  useFrame((_, delta) => {
    easing.dampC(baseMat.color, snap.selectedColor, 0.25, delta);
  });

  const geometry = isClassic
    ? nodes.Cloth.geometry
    : nodes.T_Shirt_male.geometry;

  const rotation = isClassic
    ? [Math.PI / 2, 0, 0.175]
    : [Math.PI / 2, 0, 0.175];

  const decalPos = advanced
    ? snap.decalPosition ?? (isClassic ? [-0.46, 0.1, -0.2] : [-0.435, 0.1, -0.3])
    : isClassic
    ? [-0.46, 0.1, -0.2]
    : [-0.435, 0.1, -0.3];

  const decalScale = isClassic ? 0.09 : 0.12;

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={geometry}
        material={baseMat}
        position={[0.419, 0, 0]}
         rotation={[
        Math.PI / 2,                // X
         // Y от slider
        0  ,                         // Z
        (snap.rotationY * Math.PI) / 180
      ]}
      >
        <Decal
          debug={advanced}
          position={decalPos}
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
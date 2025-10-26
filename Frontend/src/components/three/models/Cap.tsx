// src/components/three/models/Cap.tsx
import { useFrame } from "@react-three/fiber";
import { useSnapshot } from "valtio";
import { state } from "../../../state";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";

type CapProps = {
  advanced?: boolean;
};

export function Cap({ advanced, ...props }: CapProps) {
  const { nodes, materials } = useGLTF("/models/cap.glb") as unknown as {
    nodes: { [key: string]: THREE.Mesh };
    materials: { [key: string]: THREE.MeshStandardMaterial };
  };

  const snap = useSnapshot(state);

  const texture = useTexture(`/images/${snap.selectedDecal}_thumb.png`);
  texture.anisotropy = 16;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.encoding = THREE.sRGBEncoding;

  const baseMat = materials["CapMaterial1"] ?? Object.values(materials)[0];

  useFrame((_, delta) => {
    easing.dampC(baseMat.color, snap.selectedColor, 0.25, delta);
  });

  const decalPos = advanced
    ? snap.decalPosition ?? [0, 0.12, 0.12]
    : [0, 0.12, 0.12];

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cap001.geometry}
        material={materials.CapMaterial1}
         rotation={[
        0,                // X
          (snap.rotationY * Math.PI) / 180,
        0                         // Z
       
      ]}
        scale={1.5}
      >
        <Decal
          debug={advanced}
          position={decalPos}
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
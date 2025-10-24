// src/components/three/models/Shoe.tsx
import { useFrame } from "@react-three/fiber";
import { useSnapshot } from "valtio";
import { state } from "../../../state/Store";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";

type ShoeProps = {
  advanced?: boolean;
};

export function Shoe({ advanced, ...props }: ShoeProps) {
  const { nodes, materials } = useGLTF("/models/shoe.glb") as unknown as {
    nodes: any;
    materials: any;
  };

  const snap = useSnapshot(state);

  const texture = useTexture(`/images/${snap.selectedDecal}_thumb.png`);
  texture.anisotropy = 16;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.encoding = THREE.sRGBEncoding;

  const baseMat = materials["Main Body Material"];

  useFrame((_, delta) => {
    easing.dampC(baseMat.color, snap.selectedColor, 0.25, delta);
  });

  const decalPos = advanced
    ? snap.decalPosition ?? [0, 0, 0.1]
    : [0, 0, 0.1];

  return (
    <group {...props} dispose={null} scale={1.2}
    
     rotation={[
        0,                // X
         // Y от slider
         (snap.rotationY * Math.PI) / 180,
        0                         // Z
        
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

      <mesh geometry={nodes.Plane040_2.geometry} material={baseMat} castShadow>
        <Decal
          debug={advanced}
          position={decalPos}
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
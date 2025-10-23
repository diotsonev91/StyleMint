// src/components/three/models/Hoodie.tsx
import { useFrame, useLoader } from "@react-three/fiber";
import { useSnapshot } from "valtio";
import { state } from  "../../../state/Store";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";

export function Hoodie(props: any) {
  const { nodes, materials } = useGLTF("/models/hoodie_test.glb") as any;
  const snap = useSnapshot(state);

  const texture = useTexture(`/images/${snap.selectedDecal}_thumb.png`);
  texture.anisotropy = 16;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.encoding = THREE.sRGBEncoding;

  useFrame((_, delta) => {
    easing.dampC(
      materials["Material238904.005"].color,
      snap.selectedColor,
      0.25,
      delta
    );
  });

   return (
    <group
      {...props}
      dispose={null}
      rotation={[
        Math.PI / 2,                // X
         // Y от slider
        0  ,                         // Z
        (snap.rotationY * Math.PI) / 180
      ]}
      scale={0.78}
      position={[0.3, 0.09, 0.0]}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_2.geometry}
        material={materials["Material238904.005"]}
      >
        <Decal
          debug
          position={snap.decalPosition ?? [-0.0, 0.1, -0.15]}
          rotation={[-Math.PI / 1.7, -Math.PI * 0.2, 0]}
          scale={0.12}
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
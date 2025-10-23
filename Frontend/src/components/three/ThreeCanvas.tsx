import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { easing } from "maath";
import "../../styles/tshirt.css";
import {
  Center,
  useGLTF,
  Environment,
  AccumulativeShadows,
  RandomizedLight,
  useTexture,
  Decal,
} from "@react-three/drei";
import * as THREE from "three";
import type { ReactNode } from "react";
import { useSnapshot } from "valtio";
import { state } from "../../state/Store";

type ThreeCanvasProps = {
  position?: [number, number, number];
  fov?: number;
};

export const ThreeCanvas = ({
  position = [-1, 0, 2.5],
  fov = 25,
}: ThreeCanvasProps) => {
  const snap = useSnapshot(state);

  return (
    <Canvas
      shadows
      eventSource={document.getElementById("root")!}
      eventPrefix="client"
      camera={{ position, fov }}
    >
      <ambientLight intensity={0.5} />
      <Environment preset="city" />

      <CameraRig>
        <Center>
          {snap.selected_type === "hoodie" && <Hoodie />}
          {snap.selected_type === "cap" && <Cap />}
          {snap.selected_type === "t_shirt_sport" && <Shirt variant="sport" />}
          {snap.selected_type === "t_shirt_classic" && (
            <Shirt variant="classic" />
          )}

          <Backdrop />
        </Center>
      </CameraRig>
    </Canvas>
  );
};


function Shirt({ variant, ...props }: { variant: "sport" | "classic" }) {
  const path =
    "sport" == variant
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
    materials.lambert1 ?? // ако го има
    materials["Material238904.005"] ?? // ако това е името
    Object.values(materials)[0]; // иначе вземи първия

  useFrame((_, delta) => {
    easing.dampC(baseMat.color, snap.selectedColor, 0.25, delta);
  });

  // -------- CONFIGS -------- //
  const geometry = isClassic
    ? nodes.Cloth.geometry // новата classic geometry
    : nodes.T_Shirt_male.geometry; // старият "baked" модел

  const rotation = isClassic
    ? [Math.PI / 2, 0, 0.175]
    : [Math.PI / 2, 0, 0.175];

  const decalPos = isClassic ? [-0.46, 0.1, -0.2] : [-0.435, 0.1, -0.3];

  const decalScale = isClassic ? 0.09 : 0.12;

  // ---------- RENDER ---------- //
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={geometry}
        material={baseMat}
        position={[0.419, 0, 0]}
        rotation={rotation}
      >
        <Decal
          debug
          position={decalPos} // ✅ push toward shirt surface
          rotation={[-Math.PI / 2, 0, 0]} // still good for orientation
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

function Hoodie(props: any) {
  const { nodes, materials } = useGLTF("/models/hoodie.glb") as unknown as {
    nodes: { [key: string]: THREE.Mesh };
    materials: { [key: string]: THREE.MeshStandardMaterial };
  };

  for (const [key, val] of Object.entries(nodes)) {
    console.log(key, val.type, val.geometry);
  }
  const snap = useSnapshot(state);

  // Load texture and set anisotropy properly
  const texture = useTexture(`/images/${snap.selectedDecal}_thumb.png`);
  texture.anisotropy = 16;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.encoding = THREE.sRGBEncoding;

  useFrame((_, delta) => {
    // easing.dampC(materials.lambert1.color, snap.selectedColor, 0.25, delta);
    easing.dampC(
      materials["Material238904.005"].color,
      snap.selectedColor,
      0.25,
      delta
    );
  });
  //materia of t_shirt : easing.dampC(materials.lambert1.color, snap.selectedColor, 0.25, delta);
  //material of hoodie : easing.dampC(materials["Material238904.005"].color, snap.selectedColor, 0.25, delta);
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_2.geometry}
        // material={materials.lambert1}
        material={materials["Material238904.005"]}
        position={[0.419, 0.09, 0.0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.78}
      >
        <Decal
          debug
          position={[-0.58, 0.1, -0.15]}
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

export function Cap(props: any) {
  const { nodes, materials } = useGLTF("/models/cap.glb") as unknown as {
    nodes: { [key: string]: THREE.Mesh };
    materials: { [key: string]: THREE.MeshStandardMaterial };
  };

  // Виж как се казват mesh и material
  console.log("=== NODES ===", nodes);
  console.log("=== MATERIALS ===", materials);

  const snap = useSnapshot(state);

  const texture = useTexture(`/images/${snap.selectedDecal}_thumb.png`);
  texture.anisotropy = 16;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.encoding = THREE.sRGBEncoding;

  // смени "SomeMaterialName" с реалното име от логовете
  const baseMat = materials["CapMaterial1"] ?? Object.values(materials)[0];

  useFrame((_, delta) => {
    easing.dampC(baseMat.color, snap.selectedColor, 0.25, delta);
  });

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cap001.geometry}
        material={materials.CapMaterial1}
        rotation={[-Math.PI / 2, -Math.PI * 2.2, 0]}
        rotation={[0, 0, 0]}
        scale={1.5}
      >
        <Decal
          position={[0, 0.12, 0.12]} // временно
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

function Backdrop() {
  const shadows = useRef<any>(null!);
  const snap = useSnapshot(state); // ✅ from valtio store

  useFrame((_, delta) => {
    if (!shadows.current) return;

    const material = shadows.current.getMesh()
      .material as THREE.MeshStandardMaterial;
    easing.dampC(material.color, snap.selectedColor, 0.25, delta);
  });

  return (
    <AccumulativeShadows
      temporal
      ref={shadows}
      frames={60}
      alphaTest={0.85}
      scale={10}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, 0, -0.14]}
    >
      <RandomizedLight
        amount={4}
        radius={9}
        intensity={0.55}
        ambient={0.25}
        position={[5, 5, -10]}
      />
      <RandomizedLight
        amount={4}
        radius={5}
        intensity={0.25}
        ambient={0.55}
        position={[-5, 5, -9]}
      />
    </AccumulativeShadows>
  );
}

function CameraRig({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    easing.dampE(
      group.current.rotation,
      [state.pointer.y / 10, -state.pointer.x / 5, 0],
      0.25,
      delta
    );
  });
  return <group ref={group}>{children}</group>;
}

useGLTF.preload("/models/hoodie_test.glb");
useGLTF.preload("/models/shirt_classic.glb");
useGLTF.preload("/models/shirt_baked.glb");
useGLTF.preload("/models/shirt_cap.glb");

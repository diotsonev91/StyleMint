import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { easing } from "maath";
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
import { state } from "../../state";
import type { CartItemState } from "../../state";

type ThreeCanvasProps = {
  position?: [number, number, number];
  fov?: number;
  isInsideCart?: boolean;
  cartItem?: CartItemState;
  tempRotationY?: number;
};

export const ThreeCanvas = ({
  position = [-1, 0, 2.5],
  fov = 25,
  isInsideCart = false,
  cartItem,
  tempRotationY,
}: ThreeCanvasProps) => {
  const snap = useSnapshot(state);

  // Decide source of selected_type
  const type = isInsideCart ? cartItem?.selected_type : snap.selected_type;

  return (
    <Canvas
      shadows
      eventSource={document.getElementById("root")!}
      eventPrefix="client"
      camera={{ position, fov }}
    >
      <ambientLight intensity={0.5} />
      <Environment preset="city" />

      <CameraRig disabled={isInsideCart} tempRotationY={tempRotationY}>
        <Center>
          {type === "hoodie" && (
            <Hoodie isInsideCart={isInsideCart} cartItem={cartItem} />
          )}
          {type === "cap" && (
            <Cap isInsideCart={isInsideCart} cartItem={cartItem} />
          )}
          {type === "t_shirt_sport" && (
            <Shirt variant="sport" isInsideCart={isInsideCart} cartItem={cartItem} />
          )}
          {type === "t_shirt_classic" && (
            <Shirt variant="classic" isInsideCart={isInsideCart} cartItem={cartItem} />
          )}
          {type === "shoe" && (
            <Shoe isInsideCart={isInsideCart} cartItem={cartItem} />
          )}
          <Backdrop isInsideCart={isInsideCart} cartItem={cartItem} />
        </Center>
      </CameraRig>
    </Canvas>
  );
};

// =====================================================
// SHIRT COMPONENT
// =====================================================

type ShirtProps = {
  variant: "sport" | "classic";
  isInsideCart?: boolean;
  cartItem?: CartItemState;
};

function Shirt({ variant, isInsideCart = false, cartItem, ...props }: ShirtProps) {
  const path =
    variant === "sport"
      ? "/models/shirt_baked.glb"
      : "/models/shirt_classic.glb";
  const { nodes, materials } = useGLTF(path) as any;

  const snap = useSnapshot(state);

  // Use cart item data if in cart, otherwise use global state
  const selectedColor = isInsideCart ? cartItem?.selectedColor : snap.selectedColor;
  const selectedDecal = isInsideCart ? cartItem?.selectedDecal : snap.selectedDecal;

  const isClassic = variant === "classic";

  const texture = useTexture(`/images/${selectedDecal}_thumb.png`);
  texture.anisotropy = 16;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.encoding = THREE.sRGBEncoding;

  const baseMat =
    materials.lambert1 ??
    materials["Material238904.005"] ??
    Object.values(materials)[0];

  useFrame((_, delta) => {
    easing.dampC(baseMat.color, selectedColor, 0.25, delta);
  });

  const geometry = isClassic
    ? nodes.Cloth.geometry
    : nodes.T_Shirt_male.geometry;

  const rotation = isClassic
    ? [Math.PI / 2, 0, 0.175]
    : [Math.PI / 2, 0, 0.175];

  const decalPos = isClassic ? [-0.46, 0.1, -0.2] : [-0.435, 0.1, -0.3];
  const decalScale = isClassic ? 0.09 : 0.12;

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={geometry}
        material={baseMat}
        position={[0.419, 0, 0]}
        rotation={rotation as [number, number, number]}
      >
        <Decal
          debug
          position={decalPos as [number, number, number]}
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

// =====================================================
// HOODIE COMPONENT
// =====================================================

type HoodieProps = {
  isInsideCart?: boolean;
  cartItem?: CartItemState;
};

function Hoodie({ isInsideCart = false, cartItem, ...props }: HoodieProps) {
  const { nodes, materials } = useGLTF("/models/hoodie.glb") as unknown as {
    nodes: { [key: string]: THREE.Mesh };
    materials: { [key: string]: THREE.MeshStandardMaterial };
  };

  const snap = useSnapshot(state);

  const selectedColor = isInsideCart ? cartItem?.selectedColor : snap.selectedColor;
  const selectedDecal = isInsideCart ? cartItem?.selectedDecal : snap.selectedDecal;

  const texture = useTexture(`/images/${selectedDecal}_thumb.png`);
  texture.anisotropy = 16;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.encoding = THREE.sRGBEncoding;

  useFrame((_, delta) => {
    easing.dampC(
      materials["Material238904.005"].color,
      selectedColor,
      0.25,
      delta
    );
  });

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_2.geometry}
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

// =====================================================
// CAP COMPONENT
// =====================================================

type CapProps = {
  isInsideCart?: boolean;
  cartItem?: CartItemState;
};

function Cap({ isInsideCart = false, cartItem, ...props }: CapProps) {
  const { nodes, materials } = useGLTF("/models/cap.glb") as unknown as {
    nodes: { [key: string]: THREE.Mesh };
    materials: { [key: string]: THREE.MeshStandardMaterial };
  };

  const snap = useSnapshot(state);

  const selectedColor = isInsideCart ? cartItem?.selectedColor : snap.selectedColor;
  const selectedDecal = isInsideCart ? cartItem?.selectedDecal : snap.selectedDecal;

  const texture = useTexture(`/images/${selectedDecal}_thumb.png`);
  texture.anisotropy = 16;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.encoding = THREE.sRGBEncoding;

  const baseMat = materials["CapMaterial1"] ?? Object.values(materials)[0];

  useFrame((_, delta) => {
    easing.dampC(baseMat.color, selectedColor, 0.25, delta);
  });

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cap001.geometry}
        material={materials.CapMaterial1}
        rotation={[0, 0, 0]}
        scale={1.5}
      >
        <Decal
          position={[0, 0.12, 0.12]}
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

// =====================================================
// SHOE COMPONENT
// =====================================================

type ShoeProps = {
  isInsideCart?: boolean;
  cartItem?: CartItemState;
};

function Shoe({ isInsideCart = false, cartItem, ...props }: ShoeProps) {
  const { nodes, materials } = useGLTF("/models/shoe.glb") as unknown as {
    nodes: any;
    materials: any;
  };

  const snap = useSnapshot(state);

  const selectedColor = isInsideCart ? cartItem?.selectedColor : snap.selectedColor;
  const selectedDecal = isInsideCart ? cartItem?.selectedDecal : snap.selectedDecal;

  const texture = useTexture(`/images/${selectedDecal}_thumb.png`);
  texture.anisotropy = 16;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.encoding = THREE.sRGBEncoding;

  const baseMat = materials["Main Body Material"];

  useFrame((_, delta) => {
    easing.dampC(baseMat.color, selectedColor, 0.25, delta);
  });

  return (
    <group {...props} dispose={null} scale={1.2}>
      <mesh geometry={nodes.Plane040.geometry} material={materials["Sole Material"]} castShadow />
      <mesh geometry={nodes.Plane040_1.geometry} material={materials["Main Body Material"]} castShadow />
      <mesh geometry={nodes.Plane040_2.geometry} material={baseMat} castShadow>
        <Decal
          position={[0, 0, 0.1]}
          rotation={[0, 0, 0]}
          scale={0.3}
          map={texture}
        />
      </mesh>
      <mesh geometry={nodes.Plane040_3.geometry} material={materials["Insole Material right"]} castShadow />
    </group>
  );
}

// =====================================================
// BACKDROP COMPONENT
// =====================================================

type BackdropProps = {
  isInsideCart?: boolean;
  cartItem?: CartItemState;
};

function Backdrop({ isInsideCart = false, cartItem }: BackdropProps) {
  const shadows = useRef<any>(null!);
  const snap = useSnapshot(state);

  const selectedColor = isInsideCart ? cartItem?.selectedColor : snap.selectedColor;

  useFrame((_, delta) => {
    if (!shadows.current) return;

    const material = shadows.current.getMesh()
      .material as THREE.MeshStandardMaterial;
    easing.dampC(material.color, selectedColor, 0.25, delta);
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

// =====================================================
// CAMERA RIG
// =====================================================

type CameraRigProps = {
  children: ReactNode;
  disabled?: boolean;
  tempRotationY?: number;
};

function CameraRig({ children, disabled = false, tempRotationY }: CameraRigProps) {
  const group = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (disabled) {
      // In cart: use manual rotation from slider
      if (tempRotationY !== undefined) {
        group.current.rotation.y = (tempRotationY * Math.PI) / 180;
      }
    } else {
      // Normal mode: follow pointer
      easing.dampE(
        group.current.rotation,
        [state.pointer.y / 10, -state.pointer.x / 5, 0],
        0.25,
        delta
      );
    }
  });

  return <group ref={group}>{children}</group>;
}

// Preload models
useGLTF.preload("/models/shoe.glb");
useGLTF.preload("/models/hoodie.glb");
useGLTF.preload("/models/shirt_classic.glb");
useGLTF.preload("/models/shirt_baked.glb");
useGLTF.preload("/models/cap.glb");
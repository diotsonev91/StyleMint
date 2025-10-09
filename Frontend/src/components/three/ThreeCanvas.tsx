import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react'
import {easing} from 'maath'
import '../../styles/tshirt.css';
import { Center, useGLTF, Environment, AccumulativeShadows, RandomizedLight } from '@react-three/drei';
import * as THREE from 'three';
import type { ReactNode } from 'react';


type ThreeCanvasProps = {
  position?: [number, number, number];
  fov?: number;
};


export const ThreeCanvas = ({position=[-1, 0, 2.5], fov=25}: ThreeCanvasProps) => (
  <Canvas 
  shadows
  eventSource={document.getElementById('root')!}
  eventPrefix='client'
  camera={{position,fov}}>
    <ambientLight intensity={0.5}/>
    <Environment preset='city'/>

    <CameraRig>
    <Center>
          <Shirt />
          <Backdrop/>
     </Center>
    </CameraRig>
  </Canvas>
);

function Shirt(props: any) {
  const { nodes, materials } = useGLTF('/models/shirt_baked.glb') as unknown as {
    nodes: { [key: string]: THREE.Mesh };
    materials: { [key: string]: THREE.Material };
  };
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.T_Shirt_male.geometry}
        material={materials.lambert1}
        position={[0.419, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

function Backdrop(){
  
    return (
   <AccumulativeShadows
      temporal
      frames={60}
      alphaTest={0.85}
      scale={10}
      rotation={[Math.PI / 2, 0, 0]}
      position={[0, 0, -0.14]}>
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
    )
}

function CameraRig({ children }: { children: ReactNode }){
  const group = useRef<THREE.Group>(null!)

  useFrame((state, delta) => {
    easing.dampE(
      group.current.rotation,
      [-state.pointer.y /5, state.pointer.x /5, 0],
      0.75,
      delta
    )
  })
    return <group ref={group}>{children}</group>
}


useGLTF.preload('/models/shirt_baked.glb')
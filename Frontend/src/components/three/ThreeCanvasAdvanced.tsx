// ThreeCanvasAdvanced.tsx
import { Canvas } from "@react-three/fiber";
import { Environment, Center } from "@react-three/drei";
import { ClickLogicInside } from "./ClickLogicInside";
import { useSnapshot } from "valtio";
import { state } from "../../state/Store";

// Import all model components
import { Hoodie } from "./models/Hoodie";
import { Shirt } from "./models/Shirt";
import { Cap } from "./models/Cap";
import { Shoe } from "./models/Shoe";

export function ThreeCanvasAdvanced() {
  const snap = useSnapshot(state);

  return (
    <Canvas shadows camera={{ position: [-1, 0, 2.5], fov: 25 }}>
      <ambientLight intensity={0.5} />
      <Environment preset="city" />

      {/* Click logic for decal placement */}
      <ClickLogicInside />

      <Center>
        {snap.selected_type === "hoodie" && <Hoodie advanced />}
        {snap.selected_type === "cap" && <Cap advanced />}
        {snap.selected_type === "t_shirt_sport" && <Shirt variant="sport" advanced />}
        {snap.selected_type === "t_shirt_classic" && <Shirt variant="classic" advanced />}
        {snap.selected_type === "shoe" && <Shoe advanced />}
      </Center>
    </Canvas>
  );
}
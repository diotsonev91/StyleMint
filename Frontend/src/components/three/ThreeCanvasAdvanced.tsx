import { Canvas } from "@react-three/fiber";
import { Environment, Center } from "@react-three/drei";
import { ClickLogicInside } from "./ClickLogicInside";
import { useSnapshot } from "valtio";
import { state } from "../../state";

// models
import { Hoodie } from "./models/Hoodie";
import { Shirt } from "./models/Shirt";
import { Cap } from "./models/Cap";
import { Shoe } from "./models/Shoe";

import type { CartItemState } from "../../state";

type Props = {
  isInsideCart?: boolean;
  cartItem?: CartItemState;      // ← when in cart
  tempRotationY?: number;        // ← cart-page slider override
};

export function ThreeCanvasAdvanced({ isInsideCart = false, cartItem, tempRotationY }: Props) {
  const snap = useSnapshot(state);

  // decide source of selected_type
  const type = isInsideCart ? cartItem?.selected_type : snap.selected_type;

  return (
    <Canvas shadows camera={{ position: [-1, 0, 2.5], fov: 25 }}>
      <ambientLight intensity={0.5} />
      <Environment preset="city" />

      {/* decal placement is disabled in cart preview */}
      {!isInsideCart && <ClickLogicInside />}

      <Center>
        {type === "hoodie" && (
          <Hoodie
            advanced
            cartItem={isInsideCart ? cartItem : undefined}
            rotationYOverride={isInsideCart ? tempRotationY : undefined}
          />
        )}
        {type === "cap" && (
          <Cap
            advanced
            cartItem={isInsideCart ? cartItem : undefined}
            rotationYOverride={isInsideCart ? tempRotationY : undefined}
          />
        )}
        {type === "t_shirt_sport" && (
          <Shirt
            variant="sport"
            advanced
            cartItem={isInsideCart ? cartItem : undefined}
            rotationYOverride={isInsideCart ? tempRotationY : undefined}
          />
        )}
        {type === "t_shirt_classic" && (
          <Shirt
            variant="classic"
            advanced
            cartItem={isInsideCart ? cartItem : undefined}
            rotationYOverride={isInsideCart ? tempRotationY : undefined}
          />
        )}
        {type === "shoe" && (
          <Shoe
            advanced
            cartItem={isInsideCart ? cartItem : undefined}
            rotationYOverride={isInsideCart ? tempRotationY : undefined}
          />
        )}
      </Center>
    </Canvas>
  );
}

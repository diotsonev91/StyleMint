import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { state } from "../../state/Store";
import { useCallback } from "react";

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

export function ClickLogicInside() {
  const { camera, scene, gl } = useThree();

  const handleClick = useCallback((e: any) => {
    const bounds = gl.domElement.getBoundingClientRect();

    mouse.x = ((e.clientX - bounds.left) / bounds.width) * 2 - 1;
    mouse.y = -((e.clientY - bounds.top) / bounds.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(scene.children, true);

    if (!hits.length) return;

    const hit = hits[0];
    const local = hit.object.worldToLocal(hit.point.clone());
    state.decalPosition = local.toArray() as [number, number, number];

    // add ripple world position
    state.ripples.push({
      id: Date.now(),
      pos: hit.point.toArray() as any
    });
    console.log("DECAL AT:", state.decalPosition);
  }, [camera, scene, gl]);

  return (
    <mesh onPointerDown={handleClick}>
      {/* огромен невидим catcher */}
      <planeGeometry args={[100,100]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

import { ThreeCanvas } from "../../components/three/ThreeCanvas";
import { ThreeCanvasAdvanced } from "../../components/three/ThreeCanvasAdvanced";
import Overlay from "../../components/three/Overlay";
import { state } from "../../state/Store";
import { useSnapshot } from "valtio";

function Customize() {
  const snap = useSnapshot(state);

  return (
    <div style={{ margin: "0.8em", height: "100%" }}>
      {snap.page === "intro" && <ThreeCanvas />}
      {snap.page === "basic" && <ThreeCanvas />}
      {snap.page === "advanced" && <ThreeCanvasAdvanced />}
      
       <Overlay />
    </div>
  );
}

export default Customize;

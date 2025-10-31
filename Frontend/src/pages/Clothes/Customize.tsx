import { ThreeCanvas } from "../../components/three/ThreeCanvas";
import { ThreeCanvasAdvanced } from "../../components/three/ThreeCanvasAdvanced";
import Overlay from "../../components/three/Overlay";
import { state } from "../../state";
import { useSnapshot } from "valtio";

function Customize() {
  const snap = useSnapshot(state);

  return (
    <div style={{height: "80vh" }}>
      {snap.page === "intro" && <ThreeCanvas />}
      {snap.page === "basic" && <ThreeCanvas />}
      {snap.page === "advanced" && <ThreeCanvasAdvanced />}
      
       <Overlay />
    </div>
  );
}

export default Customize;

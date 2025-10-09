import { ThreeCanvas } from '../components/three/ThreeCanvas'

import Overlay from '../components/three/Overlay'
function CustomizeTshirt() {

  return (
    <div style={{ margin: '0.8em', height: '100%' }}>

        <ThreeCanvas></ThreeCanvas>
        <Overlay/>
    </div>
  )
}

export default CustomizeTshirt
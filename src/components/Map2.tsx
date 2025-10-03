import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useState } from "react";

export default function Map2() {
    const [zoom, setZoom] = useState(1);

    return (
       
            <div style={{ width: '100vw', height: '80vh' }}>
                <TransformWrapper
                    
                    initialScale={1}
                    minScale={0.2}
                    maxScale={3}
                    centerOnInit
                    onZoom={ref => setZoom(ref.state.scale)}
                >
                    <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                        { zoom>1.5 ? <img src="/LOD-2.svg" alt="Detailed SVG" style={{ width: '100%', height: '100%' }} /> :
                        <img src="/LOD-1.svg" alt="Large SVG" style={{ width: '100%', height: '100%' }} /> }

                    </TransformComponent>
                </TransformWrapper>
            </div>
      
    );
}
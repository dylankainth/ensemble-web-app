// src/types/react-svg-pan-zoom.d.ts
import "react-svg-pan-zoom";
import { Value } from "react-svg-pan-zoom";

declare module "react-svg-pan-zoom" {
  // remove the old declaration
  interface UncontrolledProps {
    onZoom?: never;
  }

  interface UncontrolledProps {
    onZoom?: (value: Value) => void;
  }
}

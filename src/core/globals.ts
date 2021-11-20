import { Vector2 } from "../util/vector2";
import { Matrix2d } from "../util/matrix2d";

/**
 * The `Device Pixel Ratio`, provided by the browser.
 */
export const DPR = window.devicePixelRatio;

/**
 * The affine matrix represents the DPR transform.
 */
export const DPRMatrix = Matrix2d.Create(
  Vector2.Zero,
  0,
  new Vector2(DPR, DPR)
);

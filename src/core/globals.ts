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

/**
 * 为游戏程序提供实际的逻辑屏幕大小
 *
 * 如果开启DevTools，那么该值与DevTools中的调试区域大小一致，
 * 否则一般为引擎实例化时的指定大小。
 */
export const LogicalDimension: Vector2 = Vector2.Zero;

export const LogicalScreenOffset: Vector2 = Vector2.Zero;

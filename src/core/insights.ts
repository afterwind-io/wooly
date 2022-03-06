import { SystemTimer } from "./systemTimer";
import { ReadonlyVector2 } from "../util/vector2";
import { LogicalDimension } from "./globals";

export const Insights = new (class Insights {
  /**
   * Get current size of the canvas.
   *
   * @static
   * @returns {Vector2} The size object.
   * @memberof Insights
   */
  public get Dimension(): ReadonlyVector2 {
    return LogicalDimension;
  }

  /**
   * Get the delta time of last frame .
   *
   * @static
   * @returns {number} Delta time in seconds.
   * @memberof Insights
   */
  public get Delta(): number {
    return SystemTimer.Delta;
  }
})();

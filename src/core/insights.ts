import { SystemTimer } from './systemTimer';
import { CanvasManager } from './manager/canvas';
import { Vector2 } from '../util/vector2';

export const Insights = new (class Insights {
  /**
   * Get current size of the canvas.
   *
   * @static
   * @returns {Vector2} The size object.
   * @memberof Insights
   */
  public get Dimension(): Vector2 {
    return CanvasManager.Dimension;
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

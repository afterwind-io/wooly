import { Vector2 } from "../../util/vector2";

export const CanvasManager = new (class CanvasManager {
  public container!: HTMLDivElement;
  public ctx!: CanvasRenderingContext2D;

  public SetContainer(el: HTMLDivElement): void {
    this.container = el;
  }

  public SetHost(canvas: HTMLCanvasElement, backend: "2d") {
    const ctx = canvas.getContext(backend, { alpha: false });
    if (ctx === null) {
      throw new Error("[wooly] Cannot get 2d ctx.");
    }
    this.ctx = ctx;
  }

  /**
   * Get current size of the canvas.
   *
   * @static
   * @returns {Vector2} The size object.
   * @memberof Engine
   */
  public get Dimension(): Vector2 {
    // TODO Use ResizeObserver to cut down the size query

    const canvas = this.ctx.canvas;
    return new Vector2(canvas.clientWidth, canvas.clientHeight);
  }
})();

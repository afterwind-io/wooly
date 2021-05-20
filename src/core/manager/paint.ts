import { DPR } from '../globals';
import { RenderTreeManager } from './renderTree';
import { ViewportRegistry } from '../viewport';
import { GetTransformMatrix } from '../../util/common';
import { CanvasManager } from './canvas';

export const PaintManager = new (class PaintManager {
  private clearColor: string = 'white';

  public Paint() {
    // TODO
    const ctx = CanvasManager.ctx;

    this.ResetCanvas(ctx);
    this.DrawTree(ctx);
  }

  /**
   * Specify the color to clear the canvas.
   *
   * @param {string} color
   * A string value fits the `CanvasRenderingContext2D.fillStyle` property.
   *
   * @memberof Engine
   */
  public SetClearColor(color: string) {
    this.clearColor = color;
  }

  private DrawTree(ctx: CanvasRenderingContext2D) {
    RenderTreeManager.layerMap.Traverse((layer, layerIndex) => {
      const viewport = ViewportRegistry.Get(layerIndex!);

      ctx.setTransform(
        ...GetTransformMatrix(viewport.offset, 0, viewport.zoom.Multiply(DPR))
      );

      layer.Traverse((stack) =>
        stack.Traverse((node) => {
          node.$Draw(ctx);
          node.$Melt();
        })
      );
    });
  }

  private ResetCanvas(ctx: CanvasRenderingContext2D) {
    const canvas = ctx.canvas;
    ctx.resetTransform();

    ctx.fillStyle = this.clearColor;
    ctx.fillRect(0, 0, canvas.clientWidth * DPR, canvas.clientHeight * DPR);
  }
})();

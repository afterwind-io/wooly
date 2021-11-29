import { RenderTreeManager } from "./renderTree";
import { ViewportRegistry } from "../viewport";
import { CanvasManager } from "./canvas";
import { Matrix2d } from "../../util/matrix2d";
import { RenderItem } from "../renderItem";
import { DPRMatrix } from "../globals";

export const PaintManager = new (class PaintManager {
  private clearColor: string = "white";

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
      const baseAffineMatrix = DPRMatrix.Multiply(
        viewport.GetViewportTransform()
      );

      layer.Traverse((stack) =>
        stack.Traverse((node) => {
          this.DrawNode(node, ctx, baseAffineMatrix);
          node.$Melt();
        })
      );
    });
  }

  private DrawNode(
    node: RenderItem,
    ctx: CanvasRenderingContext2D,
    baseAffineMatrix: Matrix2d
  ): void {
    if (!node.enabled) {
      return;
    }

    if (!node.customDrawing) {
      return;
    }

    const transform = baseAffineMatrix.Multiply(node.globalTransformMatrix);
    ctx.setTransform(...transform.data);

    node._Draw(ctx);
  }

  private ResetCanvas(ctx: CanvasRenderingContext2D) {
    const canvas = ctx.canvas;
    ctx.resetTransform();

    ctx.fillStyle = this.clearColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
})();

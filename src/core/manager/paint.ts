import { CompositionContext, RenderTreeManager } from "./renderTree";
import { CanvasManager } from "./canvas";
import { Matrix2d } from "../../util/matrix2d";
import { CanvasItem } from "../canvasItem";
import { DPRMatrix } from "../globals";
import { ViewportManager } from "./viewport";

export const PaintManager = new (class PaintManager {
  private clearColor: string = "white";

  public Paint() {
    // TODO
    const ctx = CanvasManager.ctx;

    this.ResetCanvas(ctx);
    this.DrawComposition(ctx, RenderTreeManager.compositionRoot);
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

  private DrawComposition(
    ctx: CanvasRenderingContext2D,
    composition: CompositionContext
  ) {
    const canvasComposition = composition.root;

    if (canvasComposition.index === 0) {
      // 系统保留，不执行clip操作
      this.DrawTree(ctx, composition);
    } else {
      ctx.save();

      const viewport = ViewportManager.Get(
        canvasComposition.globalComposition,
        canvasComposition.globalLayer
      );
      const baseAffineMatrix = DPRMatrix.Multiply(
        viewport.GetViewportTransform()
      );
      const transform = baseAffineMatrix.Multiply(
        canvasComposition.globalTransformMatrix
      );
      ctx.setTransform(...transform.data);

      const rect = new Path2D();
      const { x, y } = canvasComposition.size;
      rect.rect(0, 0, x, y);
      ctx.clip(rect);

      this.DrawTree(ctx, composition);

      ctx.restore();
    }
  }

  private DrawTree(
    ctx: CanvasRenderingContext2D,
    compositionContext: CompositionContext
  ) {
    const compositionIndex = compositionContext.root.index;

    compositionContext.layerStack.Traverse((layer, layerIndex) => {
      const viewport = ViewportManager.Get(compositionIndex, layerIndex!);
      const baseAffineMatrix = DPRMatrix.Multiply(
        viewport.GetViewportTransform()
      );

      layer.Traverse((stack) =>
        stack.Traverse((node) => {
          if (node instanceof CanvasItem) {
            this.DrawNode(node, ctx, baseAffineMatrix);
            node.$Melt();
          } else {
            this.DrawComposition(ctx, node);
          }
        })
      );
    });
  }

  private DrawNode(
    node: CanvasItem,
    ctx: CanvasRenderingContext2D,
    baseAffineMatrix: Matrix2d
  ): void {
    if (!node.customDrawing) {
      return;
    }

    const opacity = node.globalOpacity;
    if (opacity === 0) {
      return;
    }

    const transform = baseAffineMatrix.Multiply(node.globalTransformMatrix);
    ctx.setTransform(...transform.data);

    ctx.globalAlpha = opacity;

    node._Draw(ctx);

    ctx.globalAlpha = 1;
  }

  private ResetCanvas(ctx: CanvasRenderingContext2D) {
    const canvas = ctx.canvas;
    ctx.resetTransform();

    ctx.fillStyle = this.clearColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
})();

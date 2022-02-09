import { CompositionContext, RenderTreeManager } from "./renderTree";
import { CanvasManager } from "./canvas";
import { CanvasItem } from "../canvasItem";
import { DPRMatrix } from "../globals";

export const PaintManager = new (class PaintManager {
  public onPaintNode!: (node: CanvasItem) => void;

  private clearColor: string = "white";

  public Paint() {
    const ctx = CanvasManager.GetRenderContext();

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

      const transform = DPRMatrix.Multiply(
        canvasComposition.selfScreenTransform
      );
      ctx.setTransform(...transform.data);

      const rect = new Path2D();
      rect.rect(0, 0, canvasComposition.width, canvasComposition.height);
      ctx.clip(rect);

      this.DrawTree(ctx, composition);

      ctx.restore();
    }
  }

  private DrawTree(
    ctx: CanvasRenderingContext2D,
    compositionContext: CompositionContext
  ) {
    compositionContext.layerStack.Traverse((layer) => {
      layer.Traverse((stack) =>
        stack.Traverse((node) => {
          if (node instanceof CanvasItem) {
            this.DrawNode(node, ctx);
            this.onPaintNode(node);
          } else {
            this.DrawComposition(ctx, node);
          }
        })
      );
    });
  }

  private DrawNode(node: CanvasItem, ctx: CanvasRenderingContext2D): void {
    if (!node.enableDrawing) {
      return;
    }

    const opacity = node.globalOpacity;
    if (opacity === 0) {
      return;
    }

    const transform = DPRMatrix.Multiply(node.screenTransform);
    ctx.setTransform(...transform.data);

    ctx.globalAlpha = opacity;
    node._Draw(ctx);
    ctx.globalAlpha = 1;
  }

  private ResetCanvas(ctx: CanvasRenderingContext2D) {
    ctx.resetTransform();

    const canvas = ctx.canvas;
    ctx.fillStyle = this.clearColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
})();

import { DPR } from '../globals';
import { RenderTreeManager, CompositionContext } from './renderTree';
import { ViewportRegistry } from '../viewport';
import { GetTransformMatrix } from '../../util/common';
import { CanvasManager } from './canvas';
import { CompositionManager } from './composition';
import { RenderItem } from '../renderItem';
import { Vector2 } from '../../util/vector2';

const enum DrawCallType {
  Paint,
  Composite,
}

class DrawCall {
  /**
   * DrawCall indicates a drawing directive, which instruct how to paint
   *
   * @param {DrawCallType} [type=DrawCallType.Paint]
   * @param {RenderItem} node
   * @param {CanvasRenderingContext2D} ctx
   * @memberof DrawCall
   */
  public constructor(
    /**
     * The type of the draw call.
     *
     * @type {DrawCallType}
     * @memberof DrawCall
     */
    public readonly type: DrawCallType,
    public readonly node: RenderItem,
    public readonly ctx: CanvasRenderingContext2D
  ) {}

  public Composite(targetCtx: CanvasRenderingContext2D) {
    this.TransformContext(
      targetCtx,
      this.node.GlobalLayer,
      this.node.GlobalPosition,
      this.node.GlobalRotation,
      this.node.GlobalScale
    );

    const sourceCanvas = this.ctx.canvas;
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    if (width * height !== 0) {
      targetCtx.drawImage(
        sourceCanvas,
        0,
        0,
        width * DPR,
        height * DPR,
        0,
        0,
        width,
        height
      );
    }

    this.node.$Melt();
  }

  public Paint() {
    const ctx = this.ctx;

    this.TransformContext(
      ctx,
      this.node.GlobalLayer,
      this.node.CompositionPosition,
      this.node.CompositionRotation,
      this.node.CompositionScale
    );

    ctx.save();
    this.node.$Draw(ctx);
    ctx.restore();

    this.node.$Melt();
  }

  private TransformContext(
    targetCtx: CanvasRenderingContext2D,
    layer: number,
    basePosition: Vector2,
    baseRotation: number,
    baseScale: Vector2
  ) {
    const viewport = ViewportRegistry.Get(layer);

    targetCtx.setTransform(
      ...GetTransformMatrix(viewport.offset, 0, viewport.zoom.Multiply(DPR))
    );

    const position = basePosition
      .Substract(viewport.origin)
      .Rotate(-viewport.rotation);
    const rotation = baseRotation - viewport.rotation;
    const scale = baseScale;

    targetCtx.translate(position.x, position.y);
    targetCtx.rotate(rotation);
    targetCtx.scale(scale.x, scale.y);
  }
}

export const PaintManager = new (class PaintManager {
  private clearColor: string = 'white';

  public Paint() {
    const compositions = RenderTreeManager.renderContexts;
    const root = compositions.get(0)!;
    const rootCtx = CanvasManager.ctx;

    this.ResetCanvas(rootCtx);

    const drawCalls = this.build(root, rootCtx);
    this.execute(drawCalls);

    // @ts-ignore
    window.calls = drawCalls;
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

  private build(
    compositionContext: CompositionContext,
    ctx: CanvasRenderingContext2D
  ) {
    let drawCalls: DrawCall[] = [];

    const root = compositionContext.rootNode;
    compositionContext.compositionStack.Traverse((layer, layerIndex) => {
      layer.Traverse((stack) =>
        stack.Traverse((node) => {
          if (node !== root && node.composition) {
            const compositionRenderContext =
              RenderTreeManager.renderContexts.get(node.id)!;

            const composition = CompositionManager.GetComposition(node.id);
            const compositionCtx = composition.Context;

            drawCalls = drawCalls.concat(
              this.build(compositionRenderContext, compositionCtx)
            );
          } else {
            drawCalls.push(new DrawCall(DrawCallType.Paint, node, ctx));
          }
        })
      );
    });

    if (root.composition) {
      drawCalls.push(new DrawCall(DrawCallType.Composite, root, ctx));
    }

    return drawCalls;
  }

  private execute(drawCalls: DrawCall[]) {
    const baseContext = CanvasManager.ctx;

    for (const call of drawCalls) {
      if (call.type === DrawCallType.Paint) {
        call.Paint();
      } else {
        call.Composite(baseContext);
        this.ResetCanvas(call.ctx);
      }
    }
  }

  private ResetCanvas(ctx: CanvasRenderingContext2D) {
    const canvas = ctx.canvas;
    ctx.resetTransform();

    ctx.fillStyle = this.clearColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
})();

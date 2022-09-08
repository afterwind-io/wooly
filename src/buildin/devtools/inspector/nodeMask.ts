import { Entity } from "../../../core/entity";
import { DPRMatrix } from "../../../core/globals";
import { Node } from "../../../core/node";

export class NodeMask extends Entity {
  public readonly name: string = "NodeMask";
  public readonly enableDrawing: boolean = true;

  public _inspectingNode: Node | null = null;
  public _peekingNode: Node | null = null;

  private _lineDashOffset: number = 0;

  public _Draw(ctx: CanvasRenderingContext2D): void {
    if (this._peekingNode) {
      this.DrawMask(ctx, this._peekingNode);
    } else if (this._inspectingNode) {
      this.DrawMask(ctx, this._inspectingNode);
    }
  }

  private DrawMask(ctx: CanvasRenderingContext2D, node: Node | null) {
    if (!node) {
      return;
    }

    if (!(node instanceof Entity)) {
      return;
    }

    const transform = DPRMatrix.Multiply(node.screenTransform);
    ctx.setTransform(...transform.data);

    const dimension = node.dimension;
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "hsl(214deg 46% 66%)";
    ctx.fillRect(0, 0, dimension.x, dimension.y);
    ctx.globalAlpha = 1;

    ctx.lineWidth = 2;
    ctx.strokeStyle = "hsl(214deg 46% 30%)";
    ctx.setLineDash([10, 5]);
    ctx.lineDashOffset = this._lineDashOffset--;
    ctx.strokeRect(0, 0, dimension.x, dimension.y);
    ctx.setLineDash([]);
  }
}

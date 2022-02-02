import { Entity } from "../../../core/entity";
import { Node } from "../../../core/node";

export class NodeMask extends Entity {
  public readonly name: string = "NodeMask";
  public readonly enableDrawing: boolean = true;

  public _node: Node | null = null;

  public _Draw(ctx: CanvasRenderingContext2D): void {
    const node = this._node;
    if (!node) {
      return;
    }

    if (!(node instanceof Entity)) {
      return;
    }

    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "hsl(214deg 46% 66%)";

    const origin = node.ConvertToScreenPosition(node.position);
    ctx.fillRect(
      origin.x,
      origin.y,
      // @ts-expect-error
      node._intrinsicWidth || node.width,
      // @ts-expect-error
      node._intrinsicHeight || node.height
    );

    ctx.globalAlpha = 1;

    // ctx.fillStyle = "black";
    // ctx.textAlign = "end";
    // ctx.textBaseline = "top";
    // ctx.fillText(
    //   `${widget.GetDisplayName()} (${widget._intrinsicWidth}x${
    //     widget._intrinsicHeight
    //   })`,
    //   origin.x + widget._intrinsicWidth,
    //   origin.y + widget._intrinsicHeight + 4
    // );
  }
}

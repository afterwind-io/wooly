import { NodeIconBase } from "../../common/node/icon";

export class NodeIconWidget extends NodeIconBase {
  public readonly name: string = "NodeIconWidget";

  public _Draw(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 2;
    ctx.beginPath();

    ctx.strokeStyle = "hsl(214deg 46% 66%)";
    ctx.rect(0, 0, 12, 12);
    ctx.stroke();

    ctx.closePath();
  }
}

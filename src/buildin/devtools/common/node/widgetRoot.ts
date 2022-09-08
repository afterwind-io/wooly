import { NodeIconBase } from "../../common/node/icon";

export class NodeIconWidgetRoot extends NodeIconBase {
  public readonly name: string = "NodeIconWidgetRoot";

  public _Draw(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 2;
    ctx.beginPath();

    ctx.strokeStyle = "hsl(214deg 46% 66%)";
    ctx.moveTo(0, 0);
    ctx.lineTo(12, 0);
    ctx.rect(0, 4, 12, 8);
    ctx.stroke();

    ctx.closePath();
  }
}

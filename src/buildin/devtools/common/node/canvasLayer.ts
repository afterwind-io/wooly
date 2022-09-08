import { NodeIconBase } from "../../common/node/icon";

export class NodeIconCanvasLayer extends NodeIconBase {
  public readonly name: string = "NodeIconCanvasLayer";

  public _Draw(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 2;
    ctx.beginPath();

    ctx.strokeStyle = "hsl(359deg 87% 79%)";
    ctx.rect(0, 0, 9, 9);
    ctx.moveTo(12, 4);
    ctx.lineTo(12, 12);
    ctx.lineTo(4, 12);
    ctx.stroke();

    ctx.closePath();
  }
}

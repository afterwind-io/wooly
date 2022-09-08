import { NodeIconBase } from "../../common/node/icon";

export class NodeIconCanvasComposition extends NodeIconBase {
  public readonly name: string = "NodeIconCanvasComposition";

  public _Draw(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 2;
    ctx.beginPath();

    ctx.strokeStyle = "hsl(359deg 87% 79%)";
    ctx.rect(0, 0, 12, 12);
    ctx.fillStyle = "hsl(359deg 87% 79%)";
    ctx.fillRect(5, 5, 7, 7);
    ctx.stroke();

    ctx.closePath();
  }
}

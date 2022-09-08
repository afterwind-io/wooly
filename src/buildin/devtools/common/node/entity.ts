import { NodeIconBase } from "../../common/node/icon";

export class NodeIconEntity extends NodeIconBase {
  public readonly name: string = "NodeIconEntity";

  public _Draw(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 2;
    ctx.beginPath();

    ctx.strokeStyle = "hsl(359deg 87% 79%)";
    ctx.arc(6, 6, 6, 0, 360);
    ctx.stroke();

    ctx.closePath();
  }
}

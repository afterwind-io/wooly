import { Input } from "../media/input";
import { Entity } from "../../core/entity";

export class MouseIndicator extends Entity {
  public readonly customDrawing: boolean = true;
  public readonly name: string = "MouseIndicator";

  private x: number = 0;
  private y: number = 0;

  public _Draw(ctx: CanvasRenderingContext2D) {
    const x = this.x;
    const y = this.y;

    ctx.fillStyle = "grey";
    ctx.fillRect(x, y - 16, 1, 32);
    ctx.fillRect(x - 16, y, 32, 1);
    ctx.fillText(`${x},${y}`, x + 5, y - 5);
  }

  public _Update() {
    const { x, y } = Input.GetMousePosition();
    this.x = x;
    this.y = y;
  }
}

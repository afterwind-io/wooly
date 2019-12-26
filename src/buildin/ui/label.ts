import { Entity } from "../../core/entity";

export class Label extends Entity {
  public readonly customDrawing: boolean = true;
  public name: string = "Label";

  public content: string = "";
  public fillStyle: CanvasFillStrokeStyles["fillStyle"] = "";
  public font: CanvasTextDrawingStyles["font"] = "10px sans-serif";

  public _Draw(ctx: CanvasRenderingContext2D) {
    ctx.textBaseline = "top";
    ctx.font = this.font;
    ctx.fillStyle = this.fillStyle;
    ctx.fillText(this.content, 0, 0);
  }

  public SetContent(content: string): this {
    return (this.content = content), this;
  }
}

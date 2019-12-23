import { Entity } from "../core/entity";
import { Color } from "../util/color";

type ShapeType = 0 | 1;

export const SHAPE_RECT = 0 as ShapeType;
export const SHAPE_CIRCLE = 1 as ShapeType;

export class Shape extends Entity {
  private type: ShapeType;

  private radius: number = 0;
  private color: Color = new Color();

  constructor(type: ShapeType) {
    super();

    this.type = type;
  }

  public static Rectangle(): Shape {
    return new Shape(SHAPE_RECT);
  }

  public static Circle(): Shape {
    return new Shape(SHAPE_CIRCLE);
  }

  public _Draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color.ToString();

    if (this.type === SHAPE_RECT) {
      this.DrawRectangle(ctx);
    } else if (this.type === SHAPE_CIRCLE) {
      this.DrawCircle(ctx);
    }
  }

  public SetColor(color: Color): this {
    return (this.color = color), this;
  }

  public SetRadius(r: number): this {
    return (this.radius = r), this;
  }

  private DrawRectangle(ctx: CanvasRenderingContext2D) {
    ctx.fillRect(0, 0, this.w, this.h);
  }

  private DrawCircle(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

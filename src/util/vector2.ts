import { MathEx } from "./math";
import { Matrix2d } from "./matrix2d";

export type ReadonlyVector2 = Readonly<Vector2>;

export class Vector2 {
  public x: number = 0;
  public y: number = 0;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public static get Right(): Vector2 {
    return new Vector2(1, 0);
  }

  public static get Zero(): Vector2 {
    return new Vector2();
  }

  public static get One(): Vector2 {
    return new Vector2(1, 1);
  }

  public get Length(): number {
    return Math.hypot(this.x, this.y);
  }

  public Add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  public AngleTo(p: Vector2): number {
    return Math.atan2(p.y - this.y, p.x - this.x);
  }

  public Clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  public DistanceTo(v: Vector2): number {
    return this.Subtract(v).Length;
  }

  public Dot(v: Vector2): Vector2 {
    return new Vector2(this.x * v.x, this.y * v.y);
  }

  public DotProduct(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  public Subtract(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  public Equals(v: Vector2): boolean {
    return this.x === v.x && this.y === v.y;
  }

  public Flip(): Vector2 {
    return new Vector2(-this.x, -this.y);
  }

  public Lerp(target: Vector2, t: number): Vector2 {
    const x = MathEx.Lerp(t, this.x, target.x);
    const y = MathEx.Lerp(t, this.y, target.y);
    return new Vector2(x, y);
  }

  public Multiply(r: number): Vector2 {
    return new Vector2(this.x * r, this.y * r);
  }

  public Normal(): Vector2 {
    return new Vector2(this.y, -this.x);
  }

  public Normalize(): Vector2 {
    const length = this.Length;
    if (length === 0) {
      return new Vector2(this.x, this.y);
    }
    return new Vector2(this.x / length, this.y / length);
  }

  public Rotate(rad: number): Vector2 {
    var ca = Math.cos(rad);
    var sa = Math.sin(rad);
    return new Vector2(ca * this.x - sa * this.y, sa * this.x + ca * this.y);
  }

  public Transform(matrix: Matrix2d): Vector2 {
    const [a0, a1, a2, a3, a4, a5] = matrix.data;
    const { x, y } = this;

    return new Vector2(
      a0 * x + a2 * y + a4, //
      a1 * x + a3 * y + a5
    );
  }
}

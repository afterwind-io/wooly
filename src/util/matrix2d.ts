import { Vector2 } from "./vector2";

type Matrix2dArray = [number, number, number, number, number, number];

/**
 * Matrix2d is a utility wrapper around the affine matrix in 2d space.
 *
 * ```
 * [a, b, dx]
 * [c, d, dy]
 * [0, 0,  1]
 * ```
 */
export class Matrix2d {
  public readonly data: Matrix2dArray;

  public constructor(
    a: number = 0,
    b: number = 0,
    c: number = 0,
    d: number = 0,
    dx: number = 0,
    dy: number = 0
  ) {
    const m = (this.data = new Float32Array(6) as unknown as Matrix2dArray);
    m[0] = a;
    m[1] = b;
    m[2] = c;
    m[3] = d;
    m[4] = dx;
    m[5] = dy;
  }

  public static Create(
    translation: Vector2 = Vector2.Zero,
    rotation: number = 0,
    scale: Vector2 = Vector2.One
  ): Matrix2d {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const { x: sx, y: sy } = scale;
    const { x: dx, y: dy } = translation;

    return new Matrix2d(
      cos * sx, //
      sin * sx,
      -sin * sy,
      cos * sy,
      dx,
      dy
    );
  }

  public static Identity(): Matrix2d {
    return new Matrix2d(1, 0, 0, 1);
  }

  public get translation(): Vector2 {
    const [, , , , dx, dy] = this.data;
    return new Vector2(dx, dy);
  }

  public set translation(v: Vector2) {
    this.data[4] = v.x;
    this.data[5] = v.y;
  }

  public get rotation(): number {
    const [cos, sin] = this.data;
    return Math.atan2(sin, cos);
  }

  public set rotation(rad: number) {
    const scale = this.scale;

    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    this.data[0] = cos;
    this.data[1] = sin;
    this.data[2] = -sin;
    this.data[3] = cos;

    this.scale = scale;
  }

  public get scale(): Vector2 {
    const sign = Math.sign(this.Determinant());
    const [a, b, c, d] = this.data;

    return new Vector2(
      new Vector2(a, b).Length,
      new Vector2(c, d).Length * sign
    );
  }

  public set scale(scale: Vector2) {
    const [a0, b0, c0, d0] = this.data;
    const { x: a, y: b } = new Vector2(a0, b0).Normalize();
    const { x: c, y: d } = new Vector2(c0, d0).Normalize();

    const { x, y } = scale;
    this.data[0] = a * x;
    this.data[1] = b * x;
    this.data[2] = c * y;
    this.data[3] = d * y;
  }

  public Clone(): Matrix2d {
    return new Matrix2d(...this.data);
  }

  public Determinant(): number {
    const [a0, a1, a2, a3] = this.data;
    return a0 * a3 - a1 * a2;
  }

  public Invert(): Matrix2d {
    const [a, b, c, d, dx, dy] = this.data;

    let det = a * d - b * c;
    if (det === 0) {
      throw new Error("");
    }
    det = 1.0 / det;

    return new Matrix2d(
      d * det,
      -b * det,
      -c * det,
      a * det,
      (c * dy - d * dx) * det,
      (b * dx - a * dy) * det
    );
  }

  public Multiply(m: Matrix2d): Matrix2d {
    const out = Matrix2d.Identity();
    this.MultiplyInner(out, this, m);
    return out;
  }

  public MultiplyMut(m: Matrix2d): this {
    return this.MultiplyInner(this, this, m), this;
  }

  private MultiplyInner(out: Matrix2d, m1: Matrix2d, m2: Matrix2d): void {
    const [a0, a1, a2, a3, a4, a5] = m1.data;
    const [b0, b1, b2, b3, b4, b5] = m2.data;

    out.data[0] = a0 * b0 + a2 * b1;
    out.data[1] = a1 * b0 + a3 * b1;
    out.data[2] = a0 * b2 + a2 * b3;
    out.data[3] = a1 * b2 + a3 * b3;
    out.data[4] = a0 * b4 + a2 * b5 + a4;
    out.data[5] = a1 * b4 + a3 * b5 + a5;
  }
}

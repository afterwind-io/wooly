import { Vector2 } from './vector2';

/**
 * Matrix2d is a utility wrapper around the common transform matrix in 2d space.
 *
 * ```
 * [a, b, dx]
 * [c, d, dy]
 * [0, 0,  1]
 * ```
 */
export class Matrix2d {
  public readonly data: Float32Array;

  public constructor(
    a: number = 0,
    b: number = 0,
    c: number = 0,
    d: number = 0,
    dx: number = 0,
    dy: number = 0
  ) {
    const m = (this.data = new Float32Array(6));
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

  public Determinant(): number {
    const [a0, a1, a2, a3] = this.data;
    return a0 * a3 - a1 * a2;
  }

  public Multiply(m: Matrix2d): Matrix2d {
    const [a0, a1, a2, a3, a4, a5] = this.data;
    const [b0, b1, b2, b3, b4, b5] = m.data;

    return new Matrix2d(
      a0 * b0 + a2 * b1,
      a1 * b0 + a3 * b1,
      a0 * b2 + a2 * b3,
      a1 * b2 + a3 * b3,
      a0 * b4 + a2 * b5 + a4,
      a1 * b4 + a3 * b5 + a5
    );
  }

  public GetTranslation(): Vector2 {
    const [, , , , dx, dy] = this.data;
    return new Vector2(dx, dy);
  }

  public SetTranslation(translation: Vector2): void {
    this.data[4] = translation.x;
    this.data[5] = translation.y;
  }

  public GetRotation(): number {
    const [cos, sin] = this.data;
    return Math.atan2(sin, cos);
  }

  public SetRotation(rad: number): void {
    const scale = this.GetScale();

    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    this.data[0] = cos;
    this.data[1] = sin;
    this.data[2] = -sin;
    this.data[3] = cos;

    this.SetScale(scale);
  }

  public GetScale(): Vector2 {
    const sign = Math.sign(this.Determinant());
    const [a, b, c, d] = this.data;

    return new Vector2(
      new Vector2(a, b).Length,
      new Vector2(c, d).Length * sign
    );
  }

  public SetScale(scale: Vector2): void {
    const [a0, b0, c0, d0] = this.data;
    const { x: a, y: b } = new Vector2(a0, b0).Normalize();
    const { x: c, y: d } = new Vector2(c0, d0).Normalize();

    const { x, y } = scale;
    this.data[0] = a * x;
    this.data[1] = b * x;
    this.data[2] = c * y;
    this.data[3] = d * y;
  }
}

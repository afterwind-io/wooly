import { ReadonlyVector2, Vector2 } from "../util/vector2";
import { Matrix2d } from "../util/matrix2d";
import { Node } from "./node";

export class Transform extends Node {
  protected parent: Transform | null = null;

  private localTransform: Matrix2d = Matrix2d.Identity();
  private cachedGlobalTransform: Matrix2d = Matrix2d.Identity();
  private isCachedGlobalTransformDirty: boolean = true;

  /**
   * The local position relative to parent.
   */
  public get position(): ReadonlyVector2 {
    return this.localTransform.translation;
  }

  public set position(pos: ReadonlyVector2) {
    this.localTransform.translation = pos;
    this.$UpdateCachedTransform();
  }

  /**
   * The local rotation in radians relative to parent.
   */
  public get rotation(): number {
    return this.localTransform.rotation;
  }

  public set rotation(rad: number) {
    this.localTransform.rotation = rad;
    this.$UpdateCachedTransform();
  }

  /**
   * The local scale relative to parent.
   */
  public get scale(): ReadonlyVector2 {
    return this.localTransform.scale;
  }

  /**
   * Set the scale of the transform.
   *
   * *Negative scale is not supported.*
   */
  public set scale(s: ReadonlyVector2) {
    this.localTransform.scale = s;
    this.$UpdateCachedTransform();
  }

  /**
   * The actual position in world space.
   */
  public get globalPosition(): ReadonlyVector2 {
    return this.ConvertToGlobalPosition(this.position);
  }

  /**
   * The accumulated rotation in world space.
   */
  public get globalRotation(): number {
    if (!this.parent) {
      return this.rotation;
    }

    return this.globalTransformMatrix.rotation;
  }

  /**
   * The accumulated scale in world space.
   */
  public get globalScale(): ReadonlyVector2 {
    if (!this.parent) {
      return this.scale;
    }

    return this.globalTransformMatrix.scale;
  }

  /**
   * The transform matrix in world space.
   */
  public get globalTransformMatrix(): Matrix2d {
    if (!this.parent) {
      return Matrix2d.Identity();
    }

    if (this.isCachedGlobalTransformDirty) {
      this.isCachedGlobalTransformDirty = false;

      this.cachedGlobalTransform = this.parent.globalTransformMatrix.Multiply(
        this.localTransform
      );
    }

    return this.cachedGlobalTransform;
  }

  /**
   * Rotate the node based on current rotation.
   *
   * @param rad The angle in radians.
   */
  public Rotate(rad: number): void {
    this.rotation = this.rotation + rad;
  }

  /**
   * Scale the node based on current scale.
   *
   * @param s The scale vector
   */
  public Scale(s: ReadonlyVector2): void {
    this.scale = this.scale.Dot(s);
  }

  /**
   * Scale the node based on current scale
   * with the same `x` and `y` factor.
   *
   * @param factor The scale factor
   */
  public ScaleBy(factor: number): void {
    this.Scale(new Vector2(factor, factor));
  }

  /**
   * Translate the node by specified vector.
   *
   * @param v The offset vector.
   */
  public Translate(v: ReadonlyVector2): void {
    this.position = this.position.Add(v);
  }

  /**
   * Set the local position relative to parent by vector.
   *
   * @param pos Local position vector.
   */
  public SetPosition(pos: ReadonlyVector2): this;
  /**
   * Set the local position by specified value.
   *
   * @param x The position on the x-axis.
   * @param y The position on the y-axis.
   */
  public SetPosition(x: number, y: number): this;
  public SetPosition(p1: number | Vector2, p2?: number) {
    let pos: Vector2;
    if (p1 instanceof Vector2) {
      pos = p1;
    } else {
      pos = new Vector2(p1, p2);
    }

    return (this.position = pos), this;
  }

  /**
   * Set the local rotation relative to parent by radians.
   *
   * @param {number} rad The angle, in radians.
   */
  public SetRotation(rad: number): this {
    return (this.rotation = rad), this;
  }

  /**
   * Set the local scale relative to parent by vector.
   *
   * @param {Vector2} scale The scale vector.
   */
  public SetScale(scale: Vector2): this {
    return (this.scale = scale), this;
  }

  /**
   * Convert a local position to its global position.
   *
   * @param localPosition a position in the local space
   * @returns the position in the global space
   */
  protected ConvertToGlobalPosition(localPosition: Vector2): Vector2 {
    if (!this.parent) {
      return localPosition;
    }

    return localPosition.Transform(this.parent.globalTransformMatrix);
  }

  /**
   * [**Internal**]
   * **Do not call this manually**
   *
   * Update the local cache of global transform matrix.
   */
  private $UpdateCachedTransform() {
    this.isCachedGlobalTransformDirty = true;

    for (const child of this.children as Transform[]) {
      child.$UpdateCachedTransform();
    }
  }
}

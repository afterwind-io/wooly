import { ReadonlyVector2, Vector2 } from "../util/vector2";
import { Matrix2d } from "../util/matrix2d";
import { Node } from "./node";
import { GlobalComputedProperty } from "../util/globalComputedProperty";

export abstract class Tangible extends Node {
  protected abstract _screenSpaceTransform: GlobalComputedProperty<
    Tangible,
    Matrix2d
  >;
  protected _scope: Scope = new Scope(this, 0);

  private _offsetTransform: Matrix2d = Matrix2d.Identity();
  private _worldSpaceTransform: WorldSpaceTransform = new WorldSpaceTransform(
    this,
    Matrix2d.Identity()
  );

  public get dimension(): ReadonlyVector2 {
    return new Vector2(this.width, this.height);
  }

  /**
   * The pivot point of the local transform.
   * Default is the left-top corner of the Entity.
   *
   * For example, if you want to rotate the Entity by its center,
   * you may set `origin` to `new Vector2(this.width / 2, this.height / 2)`.
   */
  public get origin(): ReadonlyVector2 {
    return this._offsetTransform.translation;
  }
  public set origin(offset: ReadonlyVector2) {
    this._offsetTransform.translation = offset;
    this._worldSpaceTransform.Notify();
    this._screenSpaceTransform.Notify();
  }

  /**
   * The local position relative to parent.
   */
  public get position(): ReadonlyVector2 {
    return this._worldSpaceTransform.local.translation;
  }
  public set position(pos: ReadonlyVector2) {
    this._worldSpaceTransform.local.translation = pos;
    this._worldSpaceTransform.Notify();
    this._screenSpaceTransform.Notify();
  }

  /**
   * The local rotation in radians relative to parent.
   */
  public get rotation(): number {
    return this._worldSpaceTransform.local.rotation;
  }
  public set rotation(rad: number) {
    this._worldSpaceTransform.local.rotation = rad;
    this._worldSpaceTransform.Notify();
    this._screenSpaceTransform.Notify();
  }

  /**
   * The local scale relative to parent.
   *
   * *Negative scale is not supported.*
   */
  public get scale(): ReadonlyVector2 {
    return this._worldSpaceTransform.local.scale;
  }
  public set scale(s: ReadonlyVector2) {
    this._worldSpaceTransform.local.scale = s;
    this._worldSpaceTransform.Notify();
    this._screenSpaceTransform.Notify();
  }

  public get scope(): number {
    return this._scope.global;
  }
  public set scope(v: number) {
    this._scope.local = v;
    this._scope.Notify();
  }

  /**
   * The actual position in world space.
   */
  public get globalPosition(): ReadonlyVector2 {
    return this.ConvertToWorldSpace(this.position);
  }

  /**
   * The accumulated rotation in world space.
   */
  public get globalRotation(): number {
    if (!this.parent) {
      return this.rotation;
    }

    return this.globalTransform.rotation;
  }

  /**
   * The accumulated scale in world space.
   */
  public get globalScale(): ReadonlyVector2 {
    if (!this.parent) {
      return this.scale;
    }

    return this.globalTransform.scale;
  }

  /**
   * The transform matrix in world space.
   */
  public get globalTransform(): Matrix2d {
    return this._worldSpaceTransform.global;
  }

  public get localTransform(): Matrix2d {
    let local: Matrix2d = this._worldSpaceTransform.local;

    const offsetTransform = this._offsetTransform;
    if (!offsetTransform.isIdentity) {
      local = offsetTransform
        .Invert()
        .MultiplyMut(local.Multiply(offsetTransform));
    }

    return local;
  }

  public get screenTransform(): Matrix2d {
    return this._screenSpaceTransform.global;
  }

  /**
   * The width of the node.
   */
  public width: number = 0;

  /**
   * The height of the node.
   */
  public height: number = 0;

  /**
   * Calculate the actual position in the local space of the specified point on screen.
   *
   * @param screenPoint The point on the screen
   * @returns The local position
   */
  public ConvertScreenToLocalSpace(screenPoint: Vector2): Vector2 {
    return screenPoint.Transform(this.screenTransform.Invert());
  }

  /**
   * Calculate the actual position in the local space of the specified point in the world space.
   *
   * @param worldPoint The point in the world space
   * @returns The local position
   */
  public ConvertWorldToLocalSpace(worldPoint: Vector2): Vector2 {
    return worldPoint.Transform(this.globalTransform.Invert());
  }

  /**
   * Calculate the actual position on screen of the specified point in the local space.
   *
   * @param localPoint The point in the local space
   * @returns The screen position
   */
  public ConvertToScreenSpace(localPoint: Vector2 = Vector2.Zero): Vector2 {
    return localPoint.Transform(this.screenTransform);
  }

  /**
   * Calculate the actual position in the world space of the specified point in the local space.
   *
   * @param localPoint The point in the local space
   * @returns The world position
   */
  public ConvertToWorldSpace(localPoint: Vector2 = Vector2.Zero): Vector2 {
    return localPoint.Transform(this.globalTransform);
  }

  /**
   * Check if the specified point is within the region of current node.
   *
   * @param screenPoint The coordinate in the screen space
   * @param width The width of the region. Default is the width of the current node.
   * @param height The height of the region. Default is the height of the current node.
   * @returns
   */
  public HitTest(
    screenPoint: Vector2,
    width: number = this.width,
    height: number = this.height
  ): boolean {
    if (width * height === 0) {
      return false;
    }

    const { x, y } = this.ConvertScreenToLocalSpace(screenPoint);
    return x >= 0 && x < width && y >= 0 && y < height;
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
   * Set the pivot point of the local transform.
   *
   * @param origin The origin vector.
   * @see Tangible.origin
   */
  public SetOrigin(origin: ReadonlyVector2): this;
  /**
   * Set the pivot point of the local transform.
   *
   * @param x The offset along x-axis.
   * @param y The offset alone y-axis.
   * @see Tangible.origin
   */
  public SetOrigin(x: number, y: number): this;
  public SetOrigin(x: number | ReadonlyVector2, y?: number): this {
    let origin: ReadonlyVector2;
    if (typeof x === "number") {
      origin = new Vector2(x, y);
    } else {
      origin = x;
    }

    return (this.origin = origin), this;
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
}

class Scope extends GlobalComputedProperty<Tangible, number> {
  public ComputeGlobalValue(): number {
    const host = this.host;
    const parent = host.parent as Tangible;

    if (this.local !== 0) {
      return this.local;
    }

    if (!parent) {
      return 0;
    }

    return this.GetPropertyInstance(parent).global;
  }

  public GetPropertyInstance(
    node: Node
  ): GlobalComputedProperty<Tangible, number> {
    // @ts-expect-error TS2341 protected property
    return (node as Tangible)._scope;
  }
}

class WorldSpaceTransform extends GlobalComputedProperty<Tangible, Matrix2d> {
  public ComputeGlobalValue(): Matrix2d {
    const host = this.host;
    const parent = host.parent as Tangible;

    if (!parent) {
      return host.localTransform;
    }

    return parent.globalTransform.Multiply(host.localTransform);
  }

  public GetPropertyInstance(
    node: Node
  ): GlobalComputedProperty<Tangible, Matrix2d> | null {
    // @ts-expect-error TS2341 private property
    return (node as Tangible)._worldSpaceTransform;
  }
}

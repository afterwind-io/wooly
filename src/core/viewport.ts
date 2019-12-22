import { Vector2 } from "../util/vector2";

export class Viewport {
  private static me: Viewport;

  private offset: Vector2 = new Vector2();
  private origin: Vector2 = new Vector2();
  private rotation: number = 0;
  private zoom: Vector2 = new Vector2(1, 1);

  public static get Current(): Viewport {
    if (Viewport.me === void 0) {
      Viewport.me = new Viewport();
    }

    return Viewport.me;
  }

  public get Offset(): Vector2 {
    return this.offset;
  }

  public get Origin(): Vector2 {
    return this.origin;
  }

  public get Rotation(): number {
    return this.rotation;
  }

  public get Zoom(): Vector2 {
    return this.zoom;
  }

  public SetOffset(offset: Vector2): this {
    return (this.offset = offset), this;
  }

  public SetOrigin(origin: Vector2): this {
    return (this.origin = origin), this;
  }

  public SetRotation(rad: number): this {
    return (this.rotation = rad), this;
  }

  public SetZoom(zoom: Vector2): this {
    return (this.zoom = zoom), this;
  }
}

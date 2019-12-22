import { Entity } from "../core/entity";
import { Engine } from "../core/engine";
import { Viewport } from "../core/viewport";
import { Vector2 } from "../util/vector2";

export class Camera extends Entity {
  public readonly name: string = "Camera";

  private isCentered: boolean = false;
  private offset: Vector2 = new Vector2();

  public _Ready() {
    this.visible = false;
  }

  public _Update() {
    const position = this.GlobalPosition;
    Viewport.Current.SetOrigin(position);

    const rotation = this.GlobalRotation;
    Viewport.Current.SetRotation(rotation);

    let offset = this.offset;
    if (this.isCentered) {
      offset = offset.Add(Engine.GetDimension().Multiply(0.5));
    }
    Viewport.Current.SetOffset(offset);
  }

  public SetIsCentered(f: boolean): this {
    return (this.isCentered = f), this;
  }

  public Pan(delta: Vector2) {
    this.offset = this.offset.Add(delta);
  }

  public Rotate(delta: number) {
    const rotation = Viewport.Current.Rotation + delta;
    Viewport.Current.SetRotation(rotation);
  }

  public Zoom(delta: Vector2) {
    const zoom = Viewport.Current.Zoom.Add(delta);
    Viewport.Current.SetZoom(zoom);
  }
}

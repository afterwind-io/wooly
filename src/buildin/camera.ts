import { Entity } from "../core/entity";
import { Engine } from "../core/engine";
import { Viewport, ViewportRegistry } from "../core/viewport";
import { Vector2 } from "../util/vector2";

export class Camera extends Entity {
  public readonly name: string = "Camera";

  private isCentered: boolean = false;
  private offset: Vector2 = new Vector2();
  private targetViewport: number = 0;

  public constructor(targetViewport: number = 0) {
    super();

    this.targetViewport = targetViewport;
  }

  public _Ready() {
    this.visible = false;
  }

  public _Update() {
    const position = this.GlobalPosition;
    this.Viewport.SetOrigin(position);

    const rotation = this.GlobalRotation;
    this.Viewport.SetRotation(rotation);

    let offset = this.offset;
    if (this.isCentered) {
      offset = offset.Add(Engine.GetDimension().Multiply(0.5));
    }
    this.Viewport.SetOffset(offset);
  }

  public SetIsCentered(f: boolean): this {
    return (this.isCentered = f), this;
  }

  public SetTargetViewport(id: number): this {
    return (this.targetViewport = id), this;
  }

  public Pan(delta: Vector2) {
    this.offset = this.offset.Add(delta);
  }

  public Rotate(delta: number) {
    const rotation = this.Viewport.rotation + delta;
    this.Viewport.SetRotation(rotation);
  }

  public Zoom(delta: Vector2) {
    const zoom = this.Viewport.zoom.Add(delta);
    this.Viewport.SetZoom(zoom);
  }

  private get Viewport(): Viewport {
    return ViewportRegistry.Get(this.targetViewport);
  }
}

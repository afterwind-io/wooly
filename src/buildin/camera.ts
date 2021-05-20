import { Entity } from '../core/entity';
import { Viewport, ViewportRegistry } from '../core/viewport';
import { Vector2 } from '../util/vector2';
import { CanvasManager } from '../core/manager/canvas';

export class Camera extends Entity {
  public readonly name: string = 'Camera';

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
    this.Viewport.SetOrigin(this.GlobalPosition);
    this.Viewport.SetRotation(this.GlobalRotation);
    this.Viewport.SetZoom(this.scale);

    let offset = this.offset;
    if (this.isCentered) {
      offset = offset.Add(CanvasManager.Dimension.Multiply(0.5));
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
    this.rotation = this.rotation + delta;
  }

  public Zoom(delta: Vector2) {
    this.scale = this.scale.Add(delta);
  }

  private get Viewport(): Viewport {
    return ViewportRegistry.Get(this.targetViewport);
  }
}

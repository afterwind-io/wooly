import { Entity } from "../core/entity";
import { Viewport } from "../core/viewport";
import { Vector2 } from "../util/vector2";
import { CanvasManager } from "../core/manager/canvas";
import { ViewportManager } from "../core/manager/viewport";

export class Camera extends Entity {
  public readonly name: string = "Camera";

  private isCentered: boolean = false;
  private targetComposition: number | undefined = void 0;
  private targetLayer: number | undefined = void 0;

  public constructor(targetLayer?: number, targetComposition?: number) {
    super();

    this.targetLayer = targetLayer;
    this.targetComposition = targetComposition;
  }

  public _Update() {
    const viewport = this.GetViewport();

    // FIXME 如何降低计算频率/避免重复计算？
    viewport.origin = this.globalPosition.Transform(
      this.parentComposition.globalTransform.Invert()
    );
    viewport.rotation = this.globalRotation;
    viewport.zoom = this.scale;

    let offset = this.origin;
    if (this.isCentered) {
      offset = offset.Add(CanvasManager.Dimension.Multiply(0.5));
    }
    viewport.offset = offset;
  }

  public SetIsCentered(f: boolean): this {
    return (this.isCentered = f), this;
  }

  public SetTargetViewport(id: number): this {
    return (this.targetLayer = id), this;
  }

  public Pan(delta: Vector2) {
    this.origin = this.origin.Add(delta);
  }

  public Rotate(delta: number) {
    this.rotation = this.rotation + delta;
  }

  public Zoom(delta: Vector2) {
    this.scale = this.scale.Add(delta);
  }

  private GetViewport(): Viewport {
    const composition = this.targetComposition || this.parentComposition.index;
    const layer = this.targetLayer || this.parentLayer;

    return ViewportManager.Get(composition, layer);
  }
}

import { Entity } from "../core/entity";
import { Vector2 } from "../util/vector2";
import { ViewportRegistry } from "../core/viewport";

/**
 * A utility entity to move its descendants into an separate canvas layer.
 *
 * @export
 * @class Layer
 * @extends {Entity}
 */
export class Layer extends Entity {
  public name: string = "Layer";

  /**
   * Creates an instance of Layer.
   *
   * @param {number} layer The layer index.
   * @memberof Layer
   */
  public constructor(layer: number) {
    super();

    this.layer = layer;
  }

  public _Ready() {
    ViewportRegistry.Add(this.layer);
  }

  public _Destroy() {
    ViewportRegistry.Remove(this.layer);
  }

  public get GlobalPosition(): Vector2 {
    return Vector2.Zero;
  }

  public get GlobalRotation(): number {
    return 0;
  }

  public get GlobalScale(): Vector2 {
    return Vector2.One;
  }

  public get GlobalZIndex(): number {
    return 0;
  }
}

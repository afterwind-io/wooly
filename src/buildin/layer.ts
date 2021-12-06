import { Entity } from "../core/entity";
import { ViewportRegistry } from "../core/viewport";
import { Matrix2d } from "../util/matrix2d";

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

    this.layer.index = layer;
  }

  public _Ready() {
    ViewportRegistry.Add(this.layer.index);
  }

  public _Destroy() {
    ViewportRegistry.Remove(this.layer.index);
  }

  public get globalTransformMatrix(): Matrix2d {
    return Matrix2d.Identity();
  }
}

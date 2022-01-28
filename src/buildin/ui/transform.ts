import { Vector2 } from "../../util/vector2";
import { Constraint } from "./common/constraint";
import { Size } from "./common/types";
import { SingleChildWidgetOptions, WidgetElement } from "./foundation/types";
import { Widget } from "./foundation/widget";

interface TransformOptions extends SingleChildWidgetOptions {
  translate?: Vector2;
  rotation?: number;
  scale?: number;
}

export class Transform extends Widget<TransformOptions> {
  public readonly name: string = "Transform";

  protected _Layout(constraint: Constraint): Size {
    const child = this.GetFirstChild();
    if (child) {
      const size = child.$Layout(constraint);
      this._intrinsicWidth = size.width;
      this._intrinsicHeight = size.height;

      const { translate, rotation, scale } = this
        .options as Required<TransformOptions>;
      child.origin = new Vector2(-size.width / 2, -size.height / 2);
      child.position = translate;
      child.rotation = rotation;
      child.scale = new Vector2(scale, scale);

      return size;
    }

    this._intrinsicHeight = 0;
    this._intrinsicWidth = 0;
    return { width: 0, height: 0 };
  }

  protected _Render(): WidgetElement {
    return this.options.child;
  }

  protected NormalizeOptions(options: TransformOptions): TransformOptions {
    return {
      translate: Vector2.Zero,
      rotation: 0,
      scale: 1,
      ...options,
    };
  }
}

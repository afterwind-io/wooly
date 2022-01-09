import { Vector2 } from "../../util/vector2";
import { Constraint } from "./common/constraint";
import { Size } from "./common/types";
import {
  CommonWidgetOptions,
  SingleChildWidgetOptions,
  WidgetRenderables,
} from "./foundation/types";
import { Widget } from "./foundation/widget";

interface OffsetOptions extends CommonWidgetOptions, SingleChildWidgetOptions {
  offset: Vector2;
}

export class Offset extends Widget<OffsetOptions> {
  public readonly name: string = "Offset";

  public constructor(options: OffsetOptions) {
    super(options);
  }

  protected _Layout(constraint: Constraint): Size {
    const { offset = Vector2.Zero } = this.options;

    let size: Size = { width: 0, height: 0 };
    const child = this.options.child;
    if (child) {
      size = child.$Layout(constraint);
      child.position = offset;
    }

    this._intrinsicWidth = size.width;
    this._intrinsicHeight = size.height;
    return size;
  }

  protected _Render(): WidgetRenderables {
    return this.options.child;
  }
}

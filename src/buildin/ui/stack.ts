import { Vector2 } from "../../util/vector2";
import { Constraint } from "./common/constraint";
import { Size } from "./common/types";
import { MultiChildWidgetOptions, WidgetRenderables } from "./foundation/types";
import { Widget } from "./foundation/widget";

type StackOptions = MultiChildWidgetOptions;

export class Stack extends Widget<StackOptions> {
  public readonly name: string = "Stack";

  protected _Layout(constraint: Constraint): Size {
    let maxChildWidth: number = 0;
    let maxChildHeight: number = 0;
    for (const child of this.children as Widget[]) {
      const { width: childWidth, height: childHeight } =
        child.$Layout(constraint);
      if (childWidth > maxChildWidth) {
        maxChildWidth = childWidth;
      }
      if (childHeight > maxChildHeight) {
        maxChildHeight = childHeight;
      }

      child.position = Vector2.Zero;
    }

    this._intrinsicWidth = maxChildWidth;
    this._intrinsicHeight = maxChildHeight;
    return { width: maxChildWidth, height: maxChildHeight };
  }

  protected _Render(): WidgetRenderables {
    return this.options.children;
  }
}

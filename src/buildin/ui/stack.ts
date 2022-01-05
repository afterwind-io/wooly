import { Vector2 } from "../../util/vector2";
import { Constraint } from "./common/constraint";
import { Size } from "./common/types";
import { GetLocalLength } from "./common/utils";
import {
  CommonWidgetOptions,
  MultiChildWidgetOptions,
} from "./foundation/types";
import { Widget } from "./foundation/widget";

type StackOptions = CommonWidgetOptions & MultiChildWidgetOptions;

export class Stack extends Widget<StackOptions> {
  public readonly name: string = "Stack";

  protected _Layout(constraint: Constraint): Size {
    const desiredWidth = this.width;
    const desiredHeight = this.height;
    const localConstraint = constraint.constrain(
      false,
      desiredWidth,
      desiredHeight
    );

    let maxChildWidth: number = 0;
    let maxChildHeight: number = 0;
    for (const child of this.children as Widget[]) {
      const { width: childWidth, height: childHeight } =
        child.$Layout(localConstraint);
      if (childWidth > maxChildWidth) {
        maxChildWidth = childWidth;
      }
      if (childHeight > maxChildHeight) {
        maxChildHeight = childHeight;
      }

      child.position = Vector2.Zero;
    }

    const width = GetLocalLength(
      constraint.minWidth,
      constraint.maxWidth,
      desiredWidth,
      maxChildWidth
    );
    const height = GetLocalLength(
      constraint.minHeight,
      constraint.maxHeight,
      desiredHeight,
      maxChildHeight
    );

    this._intrinsicWidth = width;
    this._intrinsicHeight = height;
    return { width, height };
  }

  protected _Render(): Widget | Widget[] | null {
    return this.childWidgets;
  }
}

import { Widget } from "./widget";
import { Constraint } from "../common/constraint";
import { Length, Size } from "../common/types";
import { GetLocalLength } from "../common/utils";
import { SingleChildWidgetOptions as _SingleChildWidgetOptions } from "./types";

export abstract class SingleChildWidget<OPT = {}, SIG = {}> extends Widget<
  OPT,
  SIG
> {
  public abstract readonly name: string;

  protected abstract readonly isLooseBox: boolean;

  protected _Layout(constraint: Constraint): Size {
    const size = this.PerformSizing(constraint);
    this._intrinsicWidth = size.width;
    this._intrinsicHeight = size.height;

    this.PerformLayout();

    return size;
  }

  protected abstract GetHeight(): Length;

  protected abstract GetWidth(): Length;

  protected PerformLayout(): void {}

  private PerformSizing(constraint: Constraint): Size {
    const desiredWidth = this.GetWidth();
    const desiredHeight = this.GetHeight();

    let childWidth: number = 0;
    let childHeight: number = 0;

    const child = this.GetFirstChild();
    if (child) {
      const localConstraint = constraint.constrain(
        this.isLooseBox,
        desiredWidth,
        desiredHeight
      );
      const childSize = child.$Layout(localConstraint);

      childWidth = childSize.width;
      childHeight = childSize.height;
    }

    return {
      width: GetLocalLength(
        constraint.minWidth,
        constraint.maxWidth,
        desiredWidth,
        childWidth
      ),
      height: GetLocalLength(
        constraint.minHeight,
        constraint.maxHeight,
        desiredHeight,
        childHeight
      ),
    };
  }
}

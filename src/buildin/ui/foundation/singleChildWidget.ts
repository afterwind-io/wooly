import { EntitySignals } from "../../../core/entity";
import { Widget } from "./widget";
import { Constraint } from "../common/constraint";
import { Size, Length } from "../common/types";
import { GetLocalLength } from "../common/utils";
import {
  SingleChildWidgetOptions as _SingleChildWidgetOptions,
  CommonWidgetOptions,
} from "./types";

type SingleChildWidgetOptions = CommonWidgetOptions & _SingleChildWidgetOptions;

export abstract class SingleChildWidget<
  OPT = {},
  SIG extends EntitySignals = EntitySignals
> extends Widget<OPT, SIG> {
  public abstract readonly name: string;

  protected abstract readonly isLooseBox: boolean;

  public constructor(options: SingleChildWidgetOptions = {}) {
    super({ ...options, children: options.child ? [options.child] : [] });
  }

  protected _Layout(constraint: Constraint): Size {
    const size = this.PerformSizing(constraint);
    this._PerformLayout();

    this._intrinsicWidth = size.width;
    this._intrinsicHeight = size.height;
    return size;
  }

  protected _PerformLayout(): void {}

  private PerformSizing(constraint: Constraint): Size {
    const desiredWidth = this.width as Length;
    const desiredHeight = this.height as Length;

    let localWidth = 0;
    let localHeight = 0;

    const child = this.GetFirstChild();
    if (child) {
      const localConstraint = constraint.constrain(
        this.isLooseBox,
        desiredWidth,
        desiredHeight
      );

      const { width: childWidth, height: childHeight } =
        child.$Layout(localConstraint);

      localWidth = GetLocalLength(
        constraint.minWidth,
        constraint.maxWidth,
        desiredWidth,
        childWidth
      );

      localHeight = GetLocalLength(
        constraint.minHeight,
        constraint.maxHeight,
        desiredHeight,
        childHeight
      );
    } else {
      localWidth = GetLocalLength(
        constraint.minWidth,
        constraint.maxWidth,
        desiredWidth,
        0
      );

      localHeight = GetLocalLength(
        constraint.minHeight,
        constraint.maxHeight,
        desiredHeight,
        0
      );
    }

    return {
      width: localWidth,
      height: localHeight,
    };
  }
}

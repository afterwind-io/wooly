import { EntitySignals } from "../../../core/entity";
import { Constraint } from "../common/constraint";
import { Size } from "../common/types";
import { CommonWidgetOptions } from "./types";
import { Widget } from "./widget";

type NoChildWidgetOptions = CommonWidgetOptions;

export abstract class NoChildWidget<
  OPT = {},
  SIG extends EntitySignals = EntitySignals
> extends Widget<OPT, SIG> {
  public constructor(options: NoChildWidgetOptions = {}) {
    super(options);
  }

  protected _Layout(constraint: Constraint): Size {
    const size = constraint.constrainSize(this.width, this.height);
    this._intrinsicWidth = size.width;
    this._intrinsicHeight = size.height;
    return size;
  }

  protected _Render(): Widget | Widget[] | null {
    return null;
  }
}

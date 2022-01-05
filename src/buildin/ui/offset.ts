import { Vector2 } from "../../util/vector2";
import { Constraint } from "./common/constraint";
import { Size } from "./common/types";
import {
  CommonWidgetOptions,
  SingleChildWidgetOptions,
} from "./foundation/types";
import { Widget } from "./foundation/widget";

interface OffsetOptions extends CommonWidgetOptions, SingleChildWidgetOptions {
  offset?: Vector2;
}

export class Offset extends Widget<OffsetOptions> {
  public readonly name: string = "Offset";

  protected readonly isLooseBox: boolean = false;

  public constructor(options: OffsetOptions = {}) {
    super(options);
  }

  protected _Layout(constraint: Constraint): Size {
    const { offset = Vector2.Zero } = this.options;

    const desiredWidth = this.width;
    const desiredHeight = this.height;
    const localConstraint = constraint.constrain(
      false,
      desiredWidth,
      desiredHeight
    );

    let size: Size = { width: 0, height: 0 };
    const child = this.GetFirstChildWidget();
    if (child) {
      size = child.$Layout(localConstraint);
      child.position = offset;
    }

    this._intrinsicWidth = size.width;
    this._intrinsicHeight = size.height;
    return size;
  }

  protected _Render(): Widget | Widget[] | null {
    return this.childWidgets;
  }
}

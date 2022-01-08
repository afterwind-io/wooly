import { Widget } from "./foundation/widget";
import { Constraint } from "./common/constraint";
import { Size } from "./common/types";
import {
  CommonWidgetOptions,
  MultiChildWidgetOptions,
  SizableWidgetOptions,
} from "./foundation/types";
import { Vector2 } from "../../util/vector2";
import { Nullable } from "../../util/common";

type BaseOptions = CommonWidgetOptions &
  MultiChildWidgetOptions &
  SizableWidgetOptions;

interface GridOptions extends BaseOptions {
  mainAxisSpacing?: number;
  crossAxisSpacing?: number;
  crossAxisCount?: number;
  childAspectRatio?: number;
}

export class Grid extends Widget<GridOptions> {
  public readonly name: string = "Grid";

  public constructor(options: GridOptions) {
    super(options);
  }

  protected _Render(): Nullable<Widget> | Nullable<Widget>[] {
    return this.options.children;
  }

  protected _Layout(constraint: Constraint): Size {
    const size = this._PerformSizing(constraint);
    this._intrinsicWidth = size.width;
    this._intrinsicHeight = size.height;

    this._PerformLayout();

    return size;
  }

  private _PerformSizing(constraint: Constraint): Size {
    const {
      width: desiredWidth,
      height: desiredHeight,
      mainAxisSpacing,
      crossAxisSpacing,
      crossAxisCount,
      childAspectRatio,
    } = this.options as Required<GridOptions>;

    const localConstraint = constraint.constrain(
      true,
      desiredWidth,
      desiredHeight
    );

    // TODO direction?

    const mainAxisLength = localConstraint.maxWidth;
    if (mainAxisLength === Infinity) {
      throw new Error(
        "[wooly] The main axis length must not be an infinite value."
      );
    }

    const gridCellWidth =
      (mainAxisLength - mainAxisSpacing * (crossAxisCount - 1)) /
      crossAxisCount;
    const gridCellHeight = gridCellWidth * childAspectRatio;
    const childConstraint = new Constraint({
      minWidth: gridCellWidth,
      maxWidth: gridCellWidth,
      minHeight: gridCellHeight,
      maxHeight: gridCellHeight,
    });

    for (const child of this.children as Widget[]) {
      child.$Layout(childConstraint);
    }

    const mainAxisCount = Math.ceil(this.children.length / crossAxisCount);
    const crossAxisLength =
      gridCellHeight * mainAxisCount + crossAxisSpacing * (mainAxisCount - 1);
    return {
      width: mainAxisLength,
      height: crossAxisLength,
    };
  }

  private _PerformLayout() {
    const { mainAxisSpacing, crossAxisSpacing, crossAxisCount } = this
      .options as Required<GridOptions>;

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i] as Widget;
      const childPosition = Vector2.Zero;

      const mainAxisIndex = i % crossAxisCount;
      childPosition.x =
        mainAxisIndex * (child._intrinsicWidth + mainAxisSpacing);

      const crossAxisIndex = Math.round(
        (i - (i % crossAxisCount)) / crossAxisCount
      );
      childPosition.y =
        crossAxisIndex * (child._intrinsicHeight + crossAxisSpacing);

      child.position = childPosition;
    }
  }

  protected NormalizeOptions(options: GridOptions): GridOptions {
    return {
      width: "stretch",
      height: "stretch",
      mainAxisSpacing: 0,
      crossAxisSpacing: 0,
      crossAxisCount: 1,
      childAspectRatio: 1,
      ...options,
    };
  }
}

import { Widget } from "./foundation/widget";
import { Constraint } from "./common/constraint";
import { Size, Length } from "./common/types";
import {
  CommonWidgetOptions,
  MultiChildWidgetOptions,
} from "./foundation/types";
import { Vector2 } from "../../util/vector2";

interface GridOptions extends CommonWidgetOptions, MultiChildWidgetOptions {
  mainAxisSpacing?: number;
  crossAxisSpacing?: number;
  crossAxisCount?: number;
  childAspectRatio?: number;
}

const DEFAULT_MAIN_AXIS_SPACING = 0;
const DEFAULT_CROSS_AXIS_SPACING = 0;
const DEFAULT_CROSS_AXIS_COUNT = 1;
const DEFAULT_CHILD_ASPECT_RATIO = 1;

export class Grid extends Widget<GridOptions> {
  public readonly name: string = "Grid";

  public constructor(options: GridOptions = {}) {
    super(options);
  }

  protected _Render(): Widget | Widget[] | null {
    return this.childWidgets;
  }

  protected _Layout(constraint: Constraint): Size {
    const size = this._PerformSizing(constraint);
    this._intrinsicWidth = size.width;
    this._intrinsicHeight = size.height;

    this._PerformLayout();

    return size;
  }

  private _PerformSizing(constraint: Constraint): Size {
    const desiredWidth = this.width as Length;
    const desiredHeight = this.height as Length;
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

    const {
      mainAxisSpacing = DEFAULT_MAIN_AXIS_SPACING,
      crossAxisSpacing = DEFAULT_CROSS_AXIS_SPACING,
      crossAxisCount = DEFAULT_CROSS_AXIS_COUNT,
      childAspectRatio = DEFAULT_CHILD_ASPECT_RATIO,
    } = this.options;

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
    const {
      mainAxisSpacing = DEFAULT_MAIN_AXIS_SPACING,
      crossAxisSpacing = DEFAULT_CROSS_AXIS_SPACING,
      crossAxisCount = DEFAULT_CROSS_AXIS_COUNT,
    } = this.options;

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
}

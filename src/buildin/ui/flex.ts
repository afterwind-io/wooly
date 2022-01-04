import { Widget } from "./foundation/widget";
import { Constraint } from "./common/constraint";
import { Size, Length } from "./common/types";
import {
  CommonWidgetOptions,
  MultiChildWidgetOptions,
  SingleChildWidgetOptions,
} from "./foundation/types";
import { Vector2 } from "../../util/vector2";
import { SingleChildWidget } from "./foundation/singleChildWidget";

interface ExpandedOptions extends SingleChildWidgetOptions {
  flex?: number;
}

class Expanded extends SingleChildWidget {
  public readonly name: string = "Expanded";

  public readonly _flex: number;

  protected isLooseBox: boolean = true;

  public constructor(options: ExpandedOptions = {}) {
    super(options);

    this._flex = options.flex || 1;
  }

  protected _Render(): Widget | Widget[] | null {
    return this.childWidgets;
  }
}

export const enum FlexDirection {
  Horizontal,
  Vertical,
}

export const enum FlexMainAxisAlignment {
  Start,
  Center,
  End,
  SpaceAround,
  SpaceBetween,
  SpaceEvenly,
}

export const enum FlexCrossAxisAlignment {
  Start,
  Center,
  End,
  Stretch,
}

interface FlexOptions extends CommonWidgetOptions, MultiChildWidgetOptions {
  direction?: FlexDirection;
  mainAxisAlignment?: FlexMainAxisAlignment;
  crossAxisAlignment?: FlexCrossAxisAlignment;
}

export class Flex extends Widget {
  public readonly name: string = "Flex";

  private _direction: FlexDirection;
  private _mainAxisAlignment: FlexMainAxisAlignment;
  private _crossAxisAlignment: FlexCrossAxisAlignment;

  public constructor(options: FlexOptions) {
    super(options);

    const {
      direction = FlexDirection.Horizontal,
      mainAxisAlignment = FlexMainAxisAlignment.Start,
      crossAxisAlignment = FlexCrossAxisAlignment.Start,
    } = options;
    this._direction = direction;
    this._mainAxisAlignment = mainAxisAlignment;
    this._crossAxisAlignment = crossAxisAlignment;
  }

  public static Row(options: Omit<FlexOptions, "direction"> = {}): Flex {
    return new Flex({ ...options, direction: FlexDirection.Horizontal });
  }

  public static Column(options: Omit<FlexOptions, "direction"> = {}): Flex {
    return new Flex({ ...options, direction: FlexDirection.Vertical });
  }

  public static Expanded(options: ExpandedOptions = {}): Expanded {
    return new Expanded(options);
  }

  protected _Render(): Widget | Widget[] | null {
    return this.childWidgets;
  }

  protected _Layout(constraint: Constraint): Size {
    const { mainAxisLength, mainAxisFreeLength, crossAxisLength } =
      this._PerformSizing(constraint);

    this._PerformLayout(mainAxisFreeLength, crossAxisLength);

    let width: number;
    let height: number;
    if (this._direction === FlexDirection.Horizontal) {
      width = mainAxisLength;
      height = crossAxisLength;
    } else {
      width = crossAxisLength;
      height = mainAxisLength;
    }

    this._intrinsicWidth = width;
    this._intrinsicHeight = height;
    return { width, height };
  }

  private _PerformSizing(constraint: Constraint) {
    const desiredWidth = this.width as Length;
    const desiredHeight = this.height as Length;
    const localConstraint = constraint.constrain(
      true,
      desiredWidth,
      desiredHeight
    );

    const { _direction: direction, _crossAxisAlignment: crossAxisAlignment } =
      this;

    //#region
    // Calculate the total length of the children with fixed size
    let totalFlexFactor = 0;
    let totalFixedMainAxisLength = 0;
    let maxChildCrossAxisLength = 0;

    for (const child of this.childWidgets) {
      const flexFactor = GetFlexFactor(child);
      if (flexFactor > 0) {
        totalFlexFactor += flexFactor;
      } else {
        let childConstraint: Constraint;
        switch (direction) {
          case FlexDirection.Horizontal:
            childConstraint = new Constraint({
              minHeight:
                crossAxisAlignment === FlexCrossAxisAlignment.Stretch
                  ? localConstraint.maxHeight
                  : 0,
              maxHeight: localConstraint.maxHeight,
            });
            break;

          case FlexDirection.Vertical:
            childConstraint = new Constraint({
              minWidth:
                crossAxisAlignment === FlexCrossAxisAlignment.Stretch
                  ? localConstraint.maxWidth
                  : 0,
              maxWidth: localConstraint.maxWidth,
            });
            break;
        }

        const childSize = child.$Layout(childConstraint);
        totalFixedMainAxisLength += GetMainAxisLength(childSize, direction);
        maxChildCrossAxisLength = Math.max(
          maxChildCrossAxisLength,
          GetCrossAxisLength(childSize, direction)
        );
      }
    }
    //#endregion

    //#region
    // Distribute free space to all flexible children
    const maxMainAxisLength =
      direction === FlexDirection.Horizontal
        ? GetMaxAxisLength(constraint.maxWidth, desiredWidth)
        : GetMaxAxisLength(constraint.maxHeight, desiredHeight);
    const mainAxisFreeLength = Math.max(
      0,
      maxMainAxisLength - totalFixedMainAxisLength
    );
    const flexUnitLength =
      totalFlexFactor !== 0 ? mainAxisFreeLength / totalFlexFactor : 0;

    let totalFlexMainAxisLength = 0;
    for (const child of this.childWidgets) {
      const flexFactor = GetFlexFactor(child);
      if (flexFactor <= 0) {
        continue;
      }

      const flexLength = flexUnitLength * flexFactor;

      let childConstraint: Constraint;
      switch (direction) {
        case FlexDirection.Horizontal:
          childConstraint = new Constraint({
            maxWidth: flexLength,
            minHeight:
              crossAxisAlignment === FlexCrossAxisAlignment.Stretch
                ? localConstraint.maxHeight
                : 0,
            maxHeight: localConstraint.maxHeight,
          });
          break;

        case FlexDirection.Vertical:
          childConstraint = new Constraint({
            minWidth:
              crossAxisAlignment === FlexCrossAxisAlignment.Stretch
                ? localConstraint.maxWidth
                : 0,
            maxWidth: localConstraint.maxWidth,
            maxHeight: flexLength,
          });
          break;
      }

      const childSize = child.$Layout(childConstraint);
      totalFlexMainAxisLength += GetMainAxisLength(childSize, direction);
      maxChildCrossAxisLength = Math.max(
        maxChildCrossAxisLength,
        GetCrossAxisLength(childSize, direction)
      );
    }
    //#endregion

    const maxCrossAxisLength =
      direction === FlexDirection.Horizontal
        ? GetMaxAxisLength(constraint.maxHeight, desiredHeight)
        : GetMaxAxisLength(constraint.maxWidth, desiredWidth);
    return {
      mainAxisLength: Math.max(maxMainAxisLength, totalFixedMainAxisLength),
      mainAxisFreeLength: Math.max(
        0,
        maxMainAxisLength - totalFixedMainAxisLength - totalFlexMainAxisLength
      ),
      crossAxisLength: Math.max(maxChildCrossAxisLength, maxCrossAxisLength),
    };
  }

  private _PerformLayout(mainAxisFreeLength: number, crossAxisLength: number) {
    const childCount = this.childWidgets.length;

    let mainAxisLeading = 0;
    let mainAxisSpacing = 0;
    switch (this._mainAxisAlignment) {
      case FlexMainAxisAlignment.Start:
        mainAxisSpacing = 0;
        mainAxisLeading = 0;
        break;
      case FlexMainAxisAlignment.Center:
        mainAxisSpacing = 0;
        mainAxisLeading = mainAxisFreeLength / 2;
        break;
      case FlexMainAxisAlignment.End:
        mainAxisSpacing = 0;
        mainAxisLeading = mainAxisFreeLength;
        break;
      case FlexMainAxisAlignment.SpaceAround:
        mainAxisSpacing = mainAxisFreeLength / childCount;
        mainAxisLeading = mainAxisSpacing / 2;
        break;
      case FlexMainAxisAlignment.SpaceBetween:
        mainAxisSpacing = mainAxisFreeLength / (childCount - 1);
        mainAxisLeading = 0;
        break;
      case FlexMainAxisAlignment.SpaceEvenly:
        mainAxisSpacing = mainAxisFreeLength / (childCount + 1);
        mainAxisLeading = mainAxisSpacing;
      default:
        break;
    }

    let mainAxisLengthAttr: "_intrinsicWidth" | "_intrinsicHeight";
    let crossAxisLengthAttr: "_intrinsicWidth" | "_intrinsicHeight";
    let mainAxisPosAttr: "x" | "y";
    let crossAxisPosAttr: "x" | "y";
    if (this._direction === FlexDirection.Horizontal) {
      mainAxisLengthAttr = "_intrinsicWidth";
      crossAxisLengthAttr = "_intrinsicHeight";
      mainAxisPosAttr = "x";
      crossAxisPosAttr = "y";
    } else {
      mainAxisLengthAttr = "_intrinsicHeight";
      crossAxisLengthAttr = "_intrinsicWidth";
      mainAxisPosAttr = "y";
      crossAxisPosAttr = "x";
    }

    let mainAxisPointer = mainAxisLeading;
    for (const child of this.childWidgets) {
      const childPosition = Vector2.Zero;

      // Main axis positioning
      const mainAxisStep = child[mainAxisLengthAttr];
      childPosition[mainAxisPosAttr] = mainAxisPointer;
      mainAxisPointer += mainAxisStep + mainAxisSpacing;

      // Cross axis positioning
      let crossAxisLeading = 0;
      switch (this._crossAxisAlignment) {
        case FlexCrossAxisAlignment.Start:
        case FlexCrossAxisAlignment.Stretch:
          crossAxisLeading = 0;
          break;
        case FlexCrossAxisAlignment.Center:
          crossAxisLeading = (crossAxisLength - child[crossAxisLengthAttr]) / 2;
          break;
        case FlexCrossAxisAlignment.End:
          crossAxisLeading = crossAxisLength - child[crossAxisLengthAttr];
          break;
        default:
          break;
      }
      childPosition[crossAxisPosAttr] = crossAxisLeading;

      child.position = childPosition;
    }
  }
}

function GetFlexFactor(child: Widget): number {
  if (child instanceof Expanded) {
    return child._flex;
  }

  return 0;
}

function GetMainAxisLength(size: Size, direction: FlexDirection): number {
  if (direction === FlexDirection.Horizontal) {
    return size.width;
  } else {
    return size.height;
  }
}

function GetCrossAxisLength(size: Size, direction: FlexDirection): number {
  if (direction === FlexDirection.Horizontal) {
    return size.height;
  } else {
    return size.width;
  }
}

function GetMaxAxisLength(maxLength: number, desiredLength: Length): number {
  if (desiredLength === "stretch") {
    return maxLength;
  } else if (desiredLength === "shrink") {
    /**
     * If the width of `Flex` depends on the total width of children,
     * there should be no free room for flexible children.
     */
    return 0;
  } else {
    return Math.min(maxLength, desiredLength);
  }
}

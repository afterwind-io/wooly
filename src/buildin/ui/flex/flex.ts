import { Vector2 } from "../../../util/vector2";
import { Constraint } from "../common/constraint";
import { Size } from "../common/types";
import {
  CommonWidgetOptions,
  MultiChildWidgetOptions,
  SizableWidgetOptions,
} from "../foundation/types";
import { Widget } from "../foundation/widget";
import { Expanded, ExpandedOptions, GetFlexFactor } from "./expanded";
import {
  GetMainAxisLength,
  GetCrossAxisLength,
  GetMaxAxisLength,
} from "./utils";

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

type BaseFlexOptions = CommonWidgetOptions &
  MultiChildWidgetOptions &
  SizableWidgetOptions;

interface FlexOptions extends BaseFlexOptions {
  direction?: FlexDirection;
  mainAxisAlignment?: FlexMainAxisAlignment;
  crossAxisAlignment?: FlexCrossAxisAlignment;
}

export class Flex extends Widget<FlexOptions> {
  public readonly name: string = "Flex";

  public constructor(options: FlexOptions) {
    super(options);
  }

  public static Expanded(options: ExpandedOptions): Expanded {
    return new Expanded(options);
  }

  public static Shrink(options: Omit<FlexOptions, "width" | "height">): Flex {
    return new Flex({ ...options, width: "shrink", height: "shrink" });
  }

  public static Stretch(options: Omit<FlexOptions, "width" | "height">): Flex {
    return new Flex({ ...options, width: "stretch", height: "stretch" });
  }

  protected _Render(): Widget | Widget[] | null {
    return this.options.children;
  }

  protected _Layout(constraint: Constraint): Size {
    const { mainAxisLength, mainAxisFreeLength, crossAxisLength } =
      this._PerformSizing(constraint);

    this._PerformLayout(mainAxisFreeLength, crossAxisLength);

    const { direction } = this.options as Required<FlexOptions>;
    let width: number;
    let height: number;
    if (direction === FlexDirection.Horizontal) {
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
    const {
      width: desiredWidth,
      height: desiredHeight,
      direction,
      crossAxisAlignment,
    } = this.options as Required<FlexOptions>;

    const localConstraint = constraint.constrain(
      true,
      desiredWidth,
      desiredHeight
    );

    //#region
    // Calculate the total length of the children with fixed size
    let totalFlexFactor = 0;
    let totalFixedMainAxisLength = 0;
    let maxChildCrossAxisLength = 0;

    for (const child of this.children as Widget[]) {
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
    for (const child of this.children as Widget[]) {
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
    const { direction, mainAxisAlignment, crossAxisAlignment, children } = this
      .options as Required<FlexOptions>;

    if (!children) {
      return;
    }

    const childCount = children.length;
    if (childCount === 0) {
      return;
    }

    let mainAxisLeading = 0;
    let mainAxisSpacing = 0;
    switch (mainAxisAlignment) {
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
    if (direction === FlexDirection.Horizontal) {
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
    for (const child of this.children as Widget[]) {
      const childPosition = Vector2.Zero;

      // Main axis positioning
      const mainAxisStep = child[mainAxisLengthAttr];
      childPosition[mainAxisPosAttr] = mainAxisPointer;
      mainAxisPointer += mainAxisStep + mainAxisSpacing;

      // Cross axis positioning
      let crossAxisLeading = 0;
      switch (crossAxisAlignment) {
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

  protected NormalizeOptions(options: FlexOptions): FlexOptions {
    return {
      width: "stretch",
      height: "stretch",
      direction: FlexDirection.Horizontal,
      mainAxisAlignment: FlexMainAxisAlignment.Start,
      crossAxisAlignment: FlexCrossAxisAlignment.Start,
      ...options,
    };
  }
}

export function Row(options: Omit<FlexOptions, "direction">): Flex {
  return new Flex({ ...options, direction: FlexDirection.Horizontal });
}
Row.Shrink = function Shrink(
  options: Omit<FlexOptions, "direction" | "width" | "height">
): Flex {
  return Flex.Shrink({ ...options, direction: FlexDirection.Horizontal });
};
Row.Stretch = function Stretch(
  options: Omit<FlexOptions, "direction" | "width" | "height">
): Flex {
  return Flex.Stretch({ ...options, direction: FlexDirection.Horizontal });
};

export function Column(options: Omit<FlexOptions, "direction">): Flex {
  return new Flex({ ...options, direction: FlexDirection.Vertical });
}
Column.Shrink = function Shrink(
  options: Omit<FlexOptions, "direction" | "width" | "height">
): Flex {
  return Flex.Shrink({ ...options, direction: FlexDirection.Vertical });
};
Column.Stretch = function Stretch(
  options: Omit<FlexOptions, "direction" | "width" | "height">
): Flex {
  return Flex.Stretch({ ...options, direction: FlexDirection.Vertical });
};

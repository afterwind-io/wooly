import { Widget } from "./foundation/widget";
import { Constraint } from "./common/constraint";
import { Size } from "./common/types";
import {
  MultiChildWidgetOptions,
  SingleChildWidgetOptions,
  SizableWidgetOptions,
  WidgetElement,
} from "./foundation/types";
import { Vector2 } from "../../util/vector2";
import { ProxyWidget } from "./foundation/proxyWidget";

interface BaseOptions extends SizableWidgetOptions {
  childAspectRatio?: number;
  columnGap?: number;
  columnCount?: number;
  rowGap?: number;
}

type GridOptions = BaseOptions & MultiChildWidgetOptions;

export class Grid extends Widget<GridOptions> {
  public readonly name: string = "Grid";

  protected _Render(): WidgetElement {
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
      rowGap,
      columnGap,
      columnCount,
      childAspectRatio,
    } = this.options as Required<GridOptions>;

    const localConstraint = constraint.constrain(
      true,
      desiredWidth,
      desiredHeight
    );

    const rowWidth = localConstraint.maxWidth;
    if (rowWidth === Infinity) {
      throw new Error("[wooly] The row width must not be an infinite value.");
    }

    const { x: gridCellWidth, y: gridCellHeight } = GetGridCellDimension(
      rowWidth,
      columnGap,
      columnCount,
      childAspectRatio
    );
    const childConstraint = new Constraint({
      minWidth: gridCellWidth,
      maxWidth: gridCellWidth,
      minHeight: gridCellHeight,
      maxHeight: gridCellHeight,
    });

    for (const child of this.children as (Widget | null)[]) {
      if (!child) {
        continue;
      }

      child.$Layout(childConstraint);
    }

    const rowCount = Math.ceil(this.children.length / columnCount);
    const totalHeight = (gridCellHeight + rowGap) * rowCount - rowGap;
    return {
      width: rowWidth,
      height: totalHeight,
    };
  }

  private _PerformLayout() {
    const { rowGap, columnGap, columnCount } = this
      .options as Required<GridOptions>;

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i] as Widget;
      const childPosition = Vector2.Zero;

      const columnIndex = i % columnCount;
      childPosition.x = columnIndex * (child._intrinsicWidth + columnGap);

      const rowIndex = Math.round((i - (i % columnCount)) / columnCount);
      childPosition.y = rowIndex * (child._intrinsicHeight + rowGap);

      child.position = childPosition;
    }
  }

  protected NormalizeOptions(options: GridOptions): GridOptions {
    return {
      width: "stretch",
      height: "stretch",
      rowGap: 0,
      columnGap: 0,
      columnCount: 1,
      childAspectRatio: 1,
      ...options,
    };
  }
}

interface GridAreaOptions extends SingleChildWidgetOptions {
  /**
   * 设置区域从哪一列开始，zero-based
   */
  columnStart: number;
  columnSpan?: number;
  /**
   * 设置区域从哪一行开始，zero-based
   */
  rowStart: number;
  rowSpan?: number;
}

export class GridArea extends ProxyWidget<GridAreaOptions> {
  public readonly name: string = "GridArea";
  public readonly childSizeIndependent: boolean = true;

  protected NormalizeOptions(options: GridAreaOptions): GridAreaOptions {
    return {
      ...options,
      columnSpan: options.columnSpan ?? 1,
      rowSpan: options.rowSpan ?? 1,
    };
  }
}

type GridViewOptions = BaseOptions & {
  children: (GridArea | null)[];
};

export class GridView extends Widget<GridViewOptions> {
  public readonly name: string = "GridView";

  protected _Layout(constraint: Constraint): Size {
    const {
      width: desiredWidth,
      height: desiredHeight,
      rowGap,
      columnGap,
      columnCount,
      childAspectRatio,
    } = this.options as Required<GridOptions>;

    const localConstraint = constraint.constrain(
      true,
      desiredWidth,
      desiredHeight
    );

    const rowWidth = localConstraint.maxWidth;
    if (rowWidth === Infinity) {
      throw new Error("[wooly] The row width must not be an infinite value.");
    }

    const { x: gridCellWidth, y: gridCellHeight } = GetGridCellDimension(
      rowWidth,
      columnGap,
      columnCount,
      childAspectRatio
    );

    let rowCount: number = 0;
    for (const child of this.children as (GridArea | null)[]) {
      if (!child) {
        continue;
      }

      const { columnStart, columnSpan, rowStart, rowSpan } =
        child.options as Required<GridAreaOptions>;

      if (columnStart + columnSpan > columnCount) {
        throw new Error(
          `[wooly] The size of GridArea exceeds the boundary of GridView.` +
            ` MaxColumn: ${columnCount}, ColumnStart:${columnStart}, ColumnSpan:${columnSpan}`
        );
      }

      rowCount = Math.max(rowCount, rowStart + rowSpan);

      const childWidth = gridCellWidth * columnSpan;
      const childHeight = gridCellHeight * rowSpan;
      child.$Layout(
        new Constraint({
          minWidth: 0,
          maxWidth: childWidth,
          minHeight: 0,
          maxHeight: childHeight,
        })
      );

      const childPosition = Vector2.Zero;
      childPosition.x = columnStart * (childWidth + columnGap);
      childPosition.y = rowStart * (childHeight + rowGap);
      child.position = childPosition;
    }

    const totalHeight = (gridCellHeight + rowGap) * rowCount - rowGap;
    return {
      width: rowWidth,
      height: totalHeight,
    };
  }

  protected _Render(): WidgetElement {
    return this.options.children;
  }

  protected NormalizeOptions(options: GridViewOptions): GridViewOptions {
    return {
      width: "stretch",
      height: "stretch",
      rowGap: 0,
      columnGap: 0,
      columnCount: 1,
      childAspectRatio: 1,
      ...options,
    };
  }
}

function GetGridCellDimension(
  rowWidth: number,
  columnGap: number,
  columnCount: number,
  childAspectRatio: number
): Vector2 {
  const gridCellWidth =
    (rowWidth - columnGap * (columnCount - 1)) / columnCount;
  const gridCellHeight = gridCellWidth * childAspectRatio;

  return new Vector2(gridCellWidth, gridCellHeight);
}

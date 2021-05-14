import { Widget } from './foundation/widget';
import { Constraint } from './common/constraint';
import { Size, Length } from './common/types';
import {
  CommonWidgetOptions,
  MultiChildWidgetOptions,
} from './foundation/types';

interface GridOptions extends CommonWidgetOptions, MultiChildWidgetOptions {
  mainAxisSpacing?: number;
  crossAxisSpacing?: number;
  crossAxisCount?: number;
  childAspectRatio?: number;
}

export class Grid extends Widget {
  public readonly name: string = 'Grid';

  private _mainAxisSpacing: number;
  private _crossAxisSpacing: number;
  private _crossAxisCount: number;
  private _childAspectRatio: number;

  public constructor(options: GridOptions = {}) {
    super(options);

    const {
      mainAxisSpacing = 0,
      crossAxisSpacing = 0,
      crossAxisCount = 1,
      childAspectRatio = 1,
    } = options;
    this._mainAxisSpacing = mainAxisSpacing;
    this._crossAxisSpacing = crossAxisSpacing;
    this._crossAxisCount = crossAxisCount;
    this._childAspectRatio = childAspectRatio;
  }

  public _Layout(constraint: Constraint): Size {
    const size = this._PerformSizing(constraint);
    this._PerformLayout();

    this._intrinsicWidth = size.width;
    this._intrinsicHeight = size.height;
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
        '[wooly] The main axis length must not be an infinite value.'
      );
    }

    const {
      _mainAxisSpacing: mainAxisSpacing,
      _crossAxisSpacing: crossAxisSpacing,
      _crossAxisCount: crossAxisCount,
      _childAspectRatio: childAspectRatio,
    } = this;

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
      child._Layout(childConstraint);
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
      _mainAxisSpacing: mainAxisSpacing,
      _crossAxisSpacing: crossAxisSpacing,
      _crossAxisCount: crossAxisCount,
    } = this;
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i] as Widget;

      const mainAxisIndex = i % crossAxisCount;
      child.position.x =
        mainAxisIndex * (child._intrinsicWidth + mainAxisSpacing);

      const crossAxisIndex = Math.round(
        (i - (i % crossAxisCount)) / crossAxisCount
      );
      child.position.y =
        crossAxisIndex * (child._intrinsicHeight + crossAxisSpacing);
    }
  }
}

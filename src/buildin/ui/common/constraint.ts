import { Length, Size } from './types';
import { Clamp } from './utils';

export class Constraint {
  public readonly minWidth: number;
  public readonly maxWidth: number;
  public readonly minHeight: number;
  public readonly maxHeight: number;

  public constructor(
    dimension: {
      minWidth?: number;
      maxWidth?: number;
      minHeight?: number;
      maxHeight?: number;
    } = {}
  ) {
    this.minWidth = dimension.minWidth || 0;
    this.maxWidth = dimension.maxWidth || Infinity;
    this.minHeight = dimension.minHeight || 0;
    this.maxHeight = dimension.maxHeight || Infinity;
  }

  public constrain(
    loose: boolean,
    desiredWidth: Length,
    desiredHeight: Length
  ): Constraint {
    const { min: minWidth, max: maxWidth } = this.constrainByDesiredLength(
      desiredWidth,
      this.minWidth,
      this.maxWidth
    );
    const { min: minHeight, max: maxHeight } = this.constrainByDesiredLength(
      desiredHeight,
      this.minHeight,
      this.maxHeight
    );

    return new Constraint({
      minWidth: loose ? 0 : minWidth,
      maxWidth,
      minHeight: loose ? 0 : minHeight,
      maxHeight,
    });
  }

  public constrainSize(desiredWidth: Length, desiredHeight: Length): Size {
    const width = this.constrainSizeByDesiredLength(
      desiredWidth,
      this.minWidth,
      this.maxWidth
    );
    const height = this.constrainSizeByDesiredLength(
      desiredHeight,
      this.minHeight,
      this.maxHeight
    );

    return { width, height };
  }

  public shrink(width: number, height: number): Constraint {
    const { minWidth, maxWidth, minHeight, maxHeight } = this;

    return new Constraint({
      minWidth: minWidth,
      maxWidth: Math.max(minWidth, maxWidth - width),
      minHeight: minHeight,
      maxHeight: Math.max(minHeight, maxHeight - height),
    });
  }

  private constrainByDesiredLength(
    desiredLength: Length,
    min: number,
    max: number
  ): { min: number; max: number } {
    if (desiredLength === 'stretch' || desiredLength === 'shrink') {
      return { min, max };
    }

    if (desiredLength > max) {
      return { min: max, max };
    }

    if (desiredLength < min) {
      return { min, max: min };
    }

    return { min: desiredLength, max: desiredLength };
  }

  private constrainSizeByDesiredLength(
    desiredLength: Length,
    min: number,
    max: number
  ): number {
    if (desiredLength === 'stretch') {
      return max;
    } else if (desiredLength === 'shrink') {
      return min;
    } else {
      return Clamp(desiredLength, min, max);
    }
  }
}

import { EntitySignals } from '../../../core/entity';
import { Widget } from './widget';
import { Constraint } from '../common/constraint';
import { Size, Length } from '../common/types';
import { Clamp } from '../common/utils';
import {
  SingleChildWidgetOptions as _SingleChildWidgetOptions,
  CommonWidgetOptions,
  ContainerWidgetOptions,
} from './types';

type SingleChildWidgetOptions = CommonWidgetOptions &
  _SingleChildWidgetOptions &
  ContainerWidgetOptions;

export abstract class SingleChildWidget<
  SIGNAL extends EntitySignals = EntitySignals
> extends Widget<SIGNAL> {
  public abstract readonly name: string;

  protected abstract readonly isLooseBox: boolean;

  public constructor(options: SingleChildWidgetOptions = {}) {
    super(options);

    const { child } = options;
    if (child) {
      this.AddChild(child);
    }
  }

  public _Layout(constraint: Constraint): Size {
    const { width, height } = this.LayoutSingleChild(constraint);
    this._intrinsicWidth = width;
    this._intrinsicHeight = height;

    this._PerformLayout();

    return { width, height };
  }

  protected _PerformLayout(): void {}

  protected GetFirstChild(): Widget<SIGNAL> | null {
    const child = this.children[0];
    if (!child) {
      return null;
    }

    if (!(child instanceof Widget)) {
      throw new Error(
        '[wooly] The child of the "Widget" must be an instance of "Widget".'
      );
    }

    return child as Widget<SIGNAL>;
  }

  private LayoutSingleChild(constraint: Constraint): Size {
    const desiredWidth = this.width as Length;
    const desiredHeight = this.height as Length;

    let localWidth = 0;
    let localHeight = 0;

    const child = this.GetFirstChild();
    if (child) {
      const border = this.border;
      const padding = this.padding;
      const localConstraint = constraint
        .constrain(this.isLooseBox, desiredWidth, desiredHeight)
        .shrink(
          border.Horizontal + padding.Horizontal,
          border.Vertical + padding.Vertical
        );

      const { width: childWidth, height: childHeight } =
        child._Layout(localConstraint);

      if (desiredWidth === 'shrink') {
        localWidth = childWidth + border.Horizontal + padding.Horizontal;
      } else if (desiredWidth === 'stretch') {
        localWidth = constraint.maxWidth;
      } else {
        localWidth = Clamp(
          desiredWidth,
          constraint.minWidth,
          constraint.maxWidth
        );
      }

      if (desiredHeight === 'shrink') {
        localHeight = childHeight + border.Vertical + padding.Vertical;
      } else if (desiredHeight === 'stretch') {
        localHeight = constraint.maxHeight;
      } else {
        localHeight = Clamp(
          desiredHeight,
          constraint.minHeight,
          constraint.maxHeight
        );
      }
    }

    const margin = this.margin;
    return {
      // FIXME stretch怎么办？
      width: localWidth + margin.Horizontal,
      height: localHeight + margin.Vertical,
    };
  }
}

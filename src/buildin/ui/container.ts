import { Vector2 } from "../../util/vector2";
import { Constraint } from "./common/constraint";
import { Edge } from "./common/edge";
import { Length, Size } from "./common/types";
import { GetLocalLength } from "./common/utils";
import {
  CommonWidgetOptions,
  SingleChildWidgetOptions,
} from "./foundation/types";
import { Widget } from "./foundation/widget";

export interface ContainerWidgetOptions
  extends SingleChildWidgetOptions,
    CommonWidgetOptions {
  border?: Edge;
  margin?: Edge;
  padding?: Edge;
}

/**
 * Provide basic container for controls.
 *
 * This is supposed to have a single child only.
 *
 * @export
 * @class Container
 * @extends {Widget}
 */
export class Container extends Widget<ContainerWidgetOptions> {
  public readonly name: string = "Container";

  protected readonly isLooseBox: boolean = true;

  private _debug: boolean;

  public constructor(
    options: ContainerWidgetOptions = {},
    debug: boolean = false
  ) {
    super(options);

    this._debug = debug;
  }

  public _Draw(ctx: CanvasRenderingContext2D): void {
    if (!this._debug) {
      return;
    }

    const {
      margin = Edge.None,
      border = Edge.None,
      padding = Edge.None,
    } = this.options;

    const w = this._intrinsicWidth;
    const h = this._intrinsicHeight;

    // Dimension
    // ctx.globalAlpha = 0.05;
    // ctx.fillStyle = 'black';
    // ctx.fillRect(0, 0, w, h);
    // ctx.globalAlpha = 1;
    // ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    // ctx.font = '8px sans-serif';
    // ctx.fillText(`${this.name}(${w.toFixed(3)}, ${h.toFixed(3)})`, 2, 10);

    ctx.globalAlpha = 0.3;

    // Margin
    ctx.fillStyle = "orange";
    ctx.fillRect(0, 0, w, margin.top);
    ctx.fillRect(0, h - margin.bottom, w, margin.bottom);
    ctx.fillRect(0, margin.top, margin.left, h - margin.Vertical);
    ctx.fillRect(
      w - margin.right,
      margin.top,
      margin.right,
      h - margin.Vertical
    );

    // Border
    ctx.fillStyle = "yellow";
    ctx.fillRect(margin.left, margin.top, w - margin.Horizontal, border.top);
    ctx.fillRect(
      margin.left,
      h - margin.bottom - border.bottom,
      w - margin.Horizontal,
      border.bottom
    );
    ctx.fillRect(
      margin.left,
      margin.top + border.top,
      border.left,
      h - margin.Vertical - border.Vertical
    );
    ctx.fillRect(
      w - margin.right - border.right,
      margin.top + border.top,
      border.right,
      h - margin.Vertical - border.Vertical
    );

    // Padding
    ctx.fillStyle = "lime";
    ctx.fillRect(
      margin.left + border.left,
      margin.top + border.top,
      w - margin.Horizontal - border.Horizontal,
      padding.top
    );
    ctx.fillRect(
      margin.left + border.left,
      h - margin.bottom - border.bottom - padding.bottom,
      w - margin.Horizontal - border.Horizontal,
      padding.bottom
    );
    ctx.fillRect(
      margin.left + border.left,
      margin.top + border.top + padding.top,
      padding.left,
      h - margin.Vertical - border.Vertical - padding.Vertical
    );
    ctx.fillRect(
      w - margin.right - border.right - padding.right,
      margin.top + border.top + padding.top,
      padding.right,
      h - margin.Vertical - border.Vertical - padding.Vertical
    );

    ctx.globalAlpha = 1;
  }

  protected _Layout(constraint: Constraint): Size {
    const size = this.PerformSizing(constraint);
    this._intrinsicWidth = size.width;
    this._intrinsicHeight = size.height;

    this.PerformLayout();

    return size;
  }

  protected _Render(): Widget | Widget[] | null {
    return this.childWidgets;
  }

  private PerformSizing(constraint: Constraint): Size {
    const {
      margin = Edge.None,
      border = Edge.None,
      padding = Edge.None,
    } = this.options;

    const desiredWidth = this.width as Length;
    const desiredHeight = this.height as Length;

    let localWidth = 0;
    let localHeight = 0;

    const child = this.GetFirstChild();
    if (child) {
      const localConstraint = constraint
        .constrain(this.isLooseBox, desiredWidth, desiredHeight)
        .shrink(
          border.Horizontal + padding.Horizontal,
          border.Vertical + padding.Vertical
        );

      const { width: childWidth, height: childHeight } =
        child.$Layout(localConstraint);

      localWidth = GetLocalLength(
        constraint.minWidth,
        constraint.maxWidth,
        desiredWidth,
        childWidth + border.Horizontal + padding.Horizontal
      );

      localHeight = GetLocalLength(
        constraint.minHeight,
        constraint.maxHeight,
        desiredHeight,
        childHeight + border.Vertical + padding.Vertical
      );
    } else {
      localWidth = GetLocalLength(
        constraint.minWidth,
        constraint.maxWidth,
        desiredWidth,
        border.Horizontal + padding.Horizontal
      );

      localHeight = GetLocalLength(
        constraint.minHeight,
        constraint.maxHeight,
        desiredHeight,
        border.Vertical + padding.Vertical
      );
    }

    return {
      // FIXME stretch怎么办？
      width: localWidth + margin.Horizontal,
      height: localHeight + margin.Vertical,
    };
  }

  private PerformLayout(): void {
    const child = this.GetFirstChild();
    if (!child) {
      return;
    }

    const {
      margin = Edge.None,
      border = Edge.None,
      padding = Edge.None,
    } = this.options;

    child.position = new Vector2(
      margin.left + border.left + padding.left,
      margin.top + border.top + padding.top
    );
  }
}

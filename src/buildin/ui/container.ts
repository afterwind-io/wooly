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
export class Container extends Widget {
  public readonly name: string = "Container";
  public border: Edge;
  public padding: Edge;
  public margin: Edge;

  protected readonly isLooseBox: boolean = true;

  private _debug: boolean;

  public constructor(
    options: ContainerWidgetOptions = {},
    debug: boolean = false
  ) {
    super({ ...options, children: options.child ? [options.child] : [] });

    this.border = options.border || Edge.None;
    this.padding = options.padding || Edge.None;
    this.margin = options.margin || Edge.None;

    this._debug = debug;
  }

  public _Draw(ctx: CanvasRenderingContext2D): void {
    if (!this._debug) {
      return;
    }

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
    ctx.fillRect(0, 0, w, this.margin.top);
    ctx.fillRect(0, h - this.margin.bottom, w, this.margin.bottom);
    ctx.fillRect(
      0,
      this.margin.top,
      this.margin.left,
      h - this.margin.Vertical
    );
    ctx.fillRect(
      w - this.margin.right,
      this.margin.top,
      this.margin.right,
      h - this.margin.Vertical
    );

    // Border
    ctx.fillStyle = "yellow";
    ctx.fillRect(
      this.margin.left,
      this.margin.top,
      w - this.margin.Horizontal,
      this.border.top
    );
    ctx.fillRect(
      this.margin.left,
      h - this.margin.bottom - this.border.bottom,
      w - this.margin.Horizontal,
      this.border.bottom
    );
    ctx.fillRect(
      this.margin.left,
      this.margin.top + this.border.top,
      this.border.left,
      h - this.margin.Vertical - this.border.Vertical
    );
    ctx.fillRect(
      w - this.margin.right - this.border.right,
      this.margin.top + this.border.top,
      this.border.right,
      h - this.margin.Vertical - this.border.Vertical
    );

    // Padding
    ctx.fillStyle = "lime";
    ctx.fillRect(
      this.margin.left + this.border.left,
      this.margin.top + this.border.top,
      w - this.margin.Horizontal - this.border.Horizontal,
      this.padding.top
    );
    ctx.fillRect(
      this.margin.left + this.border.left,
      h - this.margin.bottom - this.border.bottom - this.padding.bottom,
      w - this.margin.Horizontal - this.border.Horizontal,
      this.padding.bottom
    );
    ctx.fillRect(
      this.margin.left + this.border.left,
      this.margin.top + this.border.top + this.padding.top,
      this.padding.left,
      h - this.margin.Vertical - this.border.Vertical - this.padding.Vertical
    );
    ctx.fillRect(
      w - this.margin.right - this.border.right - this.padding.right,
      this.margin.top + this.border.top + this.padding.top,
      this.padding.right,
      h - this.margin.Vertical - this.border.Vertical - this.padding.Vertical
    );

    ctx.globalAlpha = 1;
  }

  protected _Layout(constraint: Constraint): Size {
    const size = this.PerformSizing(constraint);
    this.PerformLayout();

    this._intrinsicWidth = size.width;
    this._intrinsicHeight = size.height;
    return size;
  }

  protected _Render(): Widget | Widget[] | null {
    return this.childWidgets;
  }

  private PerformSizing(constraint: Constraint): Size {
    const desiredWidth = this.width as Length;
    const desiredHeight = this.height as Length;

    const border = this.border;
    const padding = this.padding;

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

    const margin = this.margin;
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

    child.position = new Vector2(
      this.margin.left + this.border.left + this.padding.left,
      this.margin.top + this.border.top + this.padding.top
    );
  }
}

import { Vector2 } from "../../util/vector2";
import { Constraint } from "./common/constraint";
import { Edge } from "./common/edge";
import { Size } from "./common/types";
import { GetLocalLength } from "./common/utils";
import {
  CommonWidgetOptions,
  SingleChildWidgetOptions,
  SizableWidgetOptions,
  WidgetElement,
} from "./foundation/types";
import { Widget } from "./foundation/widget";

type BaseOptions = CommonWidgetOptions &
  Partial<SingleChildWidgetOptions> &
  SizableWidgetOptions;

export interface ContainerOptions extends BaseOptions {
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
export class Container extends Widget<ContainerOptions> {
  public readonly name: string = "Container";

  private _debug: boolean;

  public constructor(options: ContainerOptions, debug: boolean = false) {
    super(options);

    this._debug = debug;
  }

  public static Stretch(
    options: Omit<ContainerOptions, "width" | "height">
  ): Container {
    return new Container({ ...options, width: "stretch", height: "stretch" });
  }

  public static Shrink(
    options: Omit<ContainerOptions, "width" | "height">
  ): Container {
    return new Container({ ...options, width: "shrink", height: "shrink" });
  }

  public _Draw(ctx: CanvasRenderingContext2D): void {
    if (!this._debug) {
      return;
    }

    const { margin, border, padding } = this
      .options as Required<ContainerOptions>;

    const w = this._intrinsicWidth;
    const h = this._intrinsicHeight;

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

  protected _Render(): WidgetElement {
    return this.options.child || null;
  }

  protected NormalizeOptions(options: ContainerOptions): ContainerOptions {
    return {
      ...options,
      width: options.width ?? "stretch",
      height: options.height ?? "stretch",
      margin: options.margin || Edge.None,
      border: options.border || Edge.None,
      padding: options.padding || Edge.None,
    };
  }

  private PerformSizing(constraint: Constraint): Size {
    const {
      margin,
      border,
      padding,
      width: desiredWidth,
      height: desiredHeight,
    } = this.options as Required<ContainerOptions>;

    let horizontal = margin.Horizontal + border.Horizontal + padding.Horizontal;
    let vertical = margin.Vertical + border.Vertical + padding.Vertical;

    let childWidth = 0;
    let childHeight = 0;

    const child = this.GetFirstChild();
    if (child) {
      const localConstraint = constraint
        .constrain(true, desiredWidth, desiredHeight)
        .shrink(horizontal, vertical);

      const size = child.$Layout(localConstraint);
      childWidth = size.width;
      childHeight = size.height;
    }

    const width = GetLocalLength(
      constraint.minWidth,
      constraint.maxWidth,
      desiredWidth,
      childWidth + horizontal
    );
    const height = GetLocalLength(
      constraint.minHeight,
      constraint.maxHeight,
      desiredHeight,
      childHeight + vertical
    );

    return { width, height };
  }

  private PerformLayout(): void {
    const child = this.GetFirstChild();
    if (!child) {
      return;
    }

    const { margin, border, padding } = this
      .options as Required<ContainerOptions>;

    child.position = new Vector2(
      margin.left + border.left + padding.left,
      margin.top + border.top + padding.top
    );
  }
}

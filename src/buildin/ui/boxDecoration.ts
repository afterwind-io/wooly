import { Vector2 } from "../../util/vector2";
import { Constraint } from "./common/constraint";
import { Edge } from "./common/edge";
import { Size } from "./common/types";
import { GetLocalLength } from "./common/utils";
import {
  SingleChildWidgetOptions,
  SizableWidgetOptions,
  WidgetElement,
} from "./foundation/types";
import { Widget } from "./foundation/widget";

interface BoxShadow {
  blur: number;
  color: string;
  offsetX?: number;
  offsetY?: number;
}

type BaseOptions = Partial<SingleChildWidgetOptions> & SizableWidgetOptions;

export interface BoxDecorationOptions extends BaseOptions {
  backgroundColor?: string;
  border?: Edge;
  borderColor?: string;
  shadows?: BoxShadow[];
}

export class BoxDecoration extends Widget<BoxDecorationOptions> {
  public readonly name: string = "BoxDecoration";
  public readonly enableDrawing: boolean = true;

  public _Draw(ctx: CanvasRenderingContext2D): void {
    const { backgroundColor, border, borderColor, shadows } = this.options;

    const width = this._intrinsicWidth;
    const height = this._intrinsicHeight;

    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;

      if (shadows) {
        for (const shadow of shadows) {
          ctx.save();

          ctx.shadowOffsetX = shadow.offsetX || 0;
          ctx.shadowOffsetY = shadow.offsetY || 0;
          ctx.shadowColor = shadow.color;
          ctx.shadowBlur = shadow.blur;
          ctx.fillRect(0, 0, width, height);

          ctx.restore();
        }
      } else {
        ctx.fillRect(0, 0, width, height);
      }
    }

    if (border) {
      ctx.fillStyle = borderColor || "black";

      if (border.top) {
        ctx.fillRect(0, 0, width, border.top);
      }
      if (border.bottom) {
        ctx.fillRect(0, height - 1, width, border.bottom);
      }
      if (border.left) {
        ctx.fillRect(0, 0, border.left, height);
      }
      if (border.right) {
        ctx.fillRect(width - 1, 0, border.right, height);
      }
    }
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

  protected NormalizeOptions(
    options: BoxDecorationOptions
  ): BoxDecorationOptions {
    return {
      ...options,
      width: options.width ?? "shrink",
      height: options.height ?? "shrink",
      border: options.border || Edge.None,
    };
  }

  private PerformSizing(constraint: Constraint): Size {
    const {
      border,
      width: desiredWidth,
      height: desiredHeight,
    } = this.options as Required<BoxDecorationOptions>;

    let horizontal = border.Horizontal;
    let vertical = border.Vertical;

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

    const { border } = this.options as Required<BoxDecorationOptions>;
    child.position = new Vector2(border.left, border.top);
  }
}

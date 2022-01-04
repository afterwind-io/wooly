import { Edge } from "./common/edge";
import { SingleChildWidget } from "./foundation/singleChildWidget";
import {
  CommonWidgetOptions,
  SingleChildWidgetOptions,
} from "./foundation/types";
import { Widget } from "./foundation/widget";

interface BoxShadow {
  blur: number;
  color: string;
  offsetX?: number;
  offsetY?: number;
}

interface BoxDecorationOptions
  extends CommonWidgetOptions,
    SingleChildWidgetOptions {
  backgroundColor?: string;
  border?: Edge;
  borderColor?: string;
  shadows?: BoxShadow[];
}

export class BoxDecoration extends SingleChildWidget<BoxDecorationOptions> {
  public readonly name: string = "BoxDecoration";
  public readonly customDrawing: boolean = true;

  protected isLooseBox: boolean = false;

  public constructor(options: BoxDecorationOptions = {}) {
    super(options);
  }

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
        ctx.fillRect(width - 1, height - 1, border.right, height);
      }
    }
  }

  protected _Render(): Widget | Widget[] | null {
    return this.childWidgets;
  }
}

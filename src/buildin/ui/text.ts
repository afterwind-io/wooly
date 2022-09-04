import { Size } from "./common/types";
import { Constraint } from "./common/constraint";
import { NoChildWidget } from "./foundation/noChildWidget";

const offscreenContext = document.createElement("canvas").getContext("2d")!;

export interface TextStyle {
  color?: CanvasFillStrokeStyles["fillStyle"];
  fontName?: string;
  fontSize?: number;
  fontWeight?: number;
}

interface TextOptions extends TextStyle {
  content: string;
}

const DEFAULT_FONT_NAME = "sans-serif";
const DEFAULT_FONT_SIZE = 12;
const DEFAULT_FONT_WEIGHT = 400;
const DEFAULT_FILL_STYLE = "black";

export class Text extends NoChildWidget<TextOptions> {
  public readonly name: string = "Text";
  public readonly enableDrawing: boolean = true;

  public _Draw(ctx: CanvasRenderingContext2D) {
    const { content, color, fontName, fontSize, fontWeight } = this
      .options as Required<TextOptions>;

    ctx.save();

    // FIXME Skip height clip due to no reliable method to measure the text height.
    ctx.beginPath();
    ctx.rect(0, 0, this._intrinsicWidth, 1000);
    ctx.clip();
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.font = this.GetFontRepr(fontWeight, fontSize, fontName);
    ctx.textBaseline = "top";
    ctx.textAlign = "start";
    ctx.fillText(content, 0, 0);

    ctx.restore();
  }

  protected _Layout(constraint: Constraint): Size {
    const { content, fontName, fontSize, fontWeight } = this
      .options as Required<TextOptions>;

    const height = fontSize;
    offscreenContext.font = this.GetFontRepr(fontWeight, fontSize, fontName);
    const { width } = offscreenContext.measureText(content);

    const { width: constrainedWidth, height: constrainedHeight } =
      constraint.constrainSize(width, height);
    this._intrinsicWidth = Math.min(width, constrainedWidth);
    this._intrinsicHeight = Math.min(height, constrainedHeight);

    return { width, height };
  }

  protected NormalizeOptions(options: TextOptions): TextOptions {
    return {
      ...options,
      color: options.color || DEFAULT_FILL_STYLE,
      content: options.content || "",
      fontName: options.fontName || DEFAULT_FONT_NAME,
      fontSize: options.fontSize || DEFAULT_FONT_SIZE,
      fontWeight: options.fontWeight || DEFAULT_FONT_WEIGHT,
    };
  }

  private GetFontRepr(
    fontWeight: number,
    fontSize: number,
    fontName: string
  ): string {
    return `${fontWeight} ${fontSize}px ${fontName}`;
  }
}

import { Size } from "./common/types";
import { Constraint } from "./common/constraint";
import { NoChildWidget } from "./foundation/noChildWidget";

// FIXME OffscreenCanvas只有chromium支持，替换成普通canvas?
// @ts-ignore
const offscreenContext = new OffscreenCanvas(0, 0).getContext("2d")!;

interface TextOptions {
  content: string;
  fontName?: string;
  fontSize?: number;
  fontWeight?: number;
  fillStyle?: CanvasFillStrokeStyles["fillStyle"];
}

const DEFAULT_FONT_NAME = "sans-serif";
const DEFAULT_FONT_SIZE = 12;
const DEFAULT_FONT_WEIGHT = 400;
const DEFAULT_FILL_STYLE = "black";

export class Text extends NoChildWidget<TextOptions> {
  public readonly name: string = "Text";
  public readonly enableDrawing: boolean = true;

  public _Draw(ctx: CanvasRenderingContext2D) {
    const {
      content = "",
      fontName = DEFAULT_FONT_NAME,
      fontSize = DEFAULT_FONT_SIZE,
      fontWeight = DEFAULT_FONT_WEIGHT,
      fillStyle = DEFAULT_FILL_STYLE,
    } = this.options;

    ctx.save();

    /**
     * FIXME
     *
     * Skip height clip due to no reliable method to measure the text height.
     */
    ctx.beginPath();
    ctx.rect(0, 0, this._intrinsicWidth, 1000);
    ctx.clip();
    ctx.closePath();

    ctx.fillStyle = fillStyle;
    ctx.font = this.GetFontRepr(fontWeight, fontSize, fontName);
    ctx.textBaseline = "top";
    ctx.textAlign = "start";
    ctx.fillText(content, 0, 0);

    ctx.restore();
  }

  protected _Layout(constraint: Constraint): Size {
    const {
      content = "",
      fontName = DEFAULT_FONT_NAME,
      fontSize = DEFAULT_FONT_SIZE,
      fontWeight = DEFAULT_FONT_WEIGHT,
    } = this.options;

    const height = fontSize;
    offscreenContext.font = this.GetFontRepr(fontWeight, fontSize, fontName);
    const { width } = offscreenContext.measureText(content);

    const { width: constrainedWidth, height: constrainedHeight } =
      constraint.constrainSize(width, height);
    this._intrinsicWidth = Math.min(width, constrainedWidth);
    this._intrinsicHeight = Math.min(height, constrainedHeight);

    return { width, height };
  }

  private GetFontRepr(
    fontWeight: number,
    fontSize: number,
    fontName: string
  ): string {
    return `${fontWeight} ${fontSize}px ${fontName}`;
  }
}

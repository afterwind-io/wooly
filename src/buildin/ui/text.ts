import { Size } from "./common/types";
import { Constraint } from "./common/constraint";
import { CommonWidgetOptions } from "./foundation/types";
import { NoChildWidget } from "./foundation/noChildWidget";

// FIXME OffscreenCanvas只有chromium支持，替换成普通canvas?
// @ts-ignore
const offscreenContext = new OffscreenCanvas(0, 0).getContext("2d")!;

interface TextOptions extends CommonWidgetOptions {
  content?: string;
  fontName?: string;
  fontSize?: number;
  fontWeight?: number;
  fillStyle?: CanvasFillStrokeStyles["fillStyle"];
}

export class Text extends NoChildWidget {
  public readonly name: string = "Text";
  public readonly customDrawing: boolean = true;

  private _content: string;
  private _fontName: string;
  private _fontSize: number;
  private _fontWeight: number;
  private _fillStyle: CanvasFillStrokeStyles["fillStyle"];

  public constructor(options: TextOptions = {}) {
    super(options);

    const {
      content = "",
      fontName = "sans-serif",
      fontSize = 12,
      fontWeight = 400,
      fillStyle = "black",
    } = options;
    this._content = content;
    this._fontName = fontName;
    this._fontSize = fontSize;
    this._fontWeight = fontWeight;
    this._fillStyle = fillStyle;
  }

  public _Draw(ctx: CanvasRenderingContext2D) {
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

    ctx.fillStyle = this._fillStyle;
    ctx.font = this.GetFontRepr();
    ctx.textBaseline = "top";
    ctx.fillText(this._content, 0, 0);

    ctx.restore();
  }

  protected _Layout(constraint: Constraint): Size {
    const height = this._fontSize;
    offscreenContext.font = this.GetFontRepr();
    const { width } = offscreenContext.measureText(this._content);

    const { width: constrainedWidth, height: constrainedHeight } =
      constraint.constrainSize(width, height);
    this._intrinsicWidth = Math.min(width, constrainedWidth);
    this._intrinsicHeight = Math.min(height, constrainedHeight);

    return { width, height };
  }

  private GetFontRepr(): string {
    return `${this._fontWeight} ${this._fontSize}px ${this._fontName}`;
  }
}

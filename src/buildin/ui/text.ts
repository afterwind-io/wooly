import { Widget, WidgetOptions } from './foundation/widget';
import { Size } from './common/types';
import { Constraint } from './common/constraint';
import { Engine } from '../../core/engine';

interface TextOptions extends WidgetOptions {
  content?: string;
  fontName?: string;
  fontSize?: number;
  fillStyle?: CanvasFillStrokeStyles['fillStyle'];
}

export class Text extends Widget {
  public readonly name: string = 'Text';

  private _content: string;
  private _fontName: string;
  private _fontSize: number;
  private _fillStyle: CanvasFillStrokeStyles['fillStyle'];

  public constructor(options: TextOptions = {}) {
    super(options);

    const {
      content = '',
      fontName = 'sans-serif',
      fontSize = 12,
      fillStyle = 'black',
    } = options;
    this._content = content;
    this._fontName = fontName;
    this._fontSize = fontSize;
    this._fillStyle = fillStyle;
  }

  public _Draw(ctx: CanvasRenderingContext2D) {
    super._Draw(ctx);

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
    ctx.font = `${this._fontSize}px ${this._fontName}`;
    ctx.textBaseline = 'top';
    ctx.fillText(this._content, 0, 0);
  }

  public _Layout(constraint: Constraint): Size {
    const ctx = Engine.Current.ctx;

    ctx.save();

    const height = this._fontSize;
    ctx.font = `${height}px ${this._fontName}`;
    const { width } = ctx.measureText(this._content);

    ctx.restore();

    const { width: constrainedWidth, height: constrainedHeight } =
      constraint.constrainSize(width, height);
    this._intrinsicWidth = Math.min(width, constrainedWidth);
    this._intrinsicHeight = Math.min(height, constrainedHeight);

    return { width, height };
  }

  public SetContent(content: string): this {
    this._content = content;
    return this;
  }
}

import { Theme } from "./common/theme";
import { SwitchCursor } from "./common/utils";
import { SingleChildWidget } from "./foundation/singleChildWidget";
import { CommonWidgetOptions } from "./foundation/types";
import { UIAction, Widget } from "./foundation/widget";
import { MouseSensor } from "./mouseSensor";

interface RadioOptions<T> extends CommonWidgetOptions {
  toggled: boolean;
  onToggle?(value: T | undefined): void;
  value?: T;
}

export class Radio<T = unknown> extends SingleChildWidget<RadioOptions<T>> {
  public readonly name: string = "Radio";
  public readonly customDrawing: boolean = true;

  protected readonly isLooseBox: boolean = false;

  protected _backgroundColor: string;
  protected _borderColor: string;

  public constructor(options: RadioOptions<T>) {
    super(options);

    const { toggled } = this.options;
    this._backgroundColor = Theme.BackgroundNormal;
    this._borderColor = toggled ? Theme.Primary : Theme.BorderNormal;

    this.OnMouseHover = this.OnMouseHover.bind(this);
    this.OnMouseDown = this.OnMouseDown.bind(this);
    this.OnMouseClick = this.OnMouseClick.bind(this);
  }

  public _Draw(ctx: CanvasRenderingContext2D) {
    const { toggled } = this.options;

    const width = this._intrinsicWidth;
    const height = this._intrinsicHeight;
    const radius = Math.min(width, height) / 2;

    ctx.fillStyle = this._backgroundColor;
    ctx.strokeStyle = this._borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.stroke();

    if (toggled) {
      ctx.fillStyle = Theme.Primary;
      ctx.beginPath();
      ctx.arc(radius, radius, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
      ctx.stroke();
    }
  }

  protected _Render(): Widget | Widget[] | null {
    return new MouseSensor({
      width: this.width,
      height: this.height,
      onHover: this.OnMouseHover,
      onKeyDown: this.OnMouseDown,
      onClick: this.OnMouseClick,
    });
  }

  @UIAction
  private OnMouseHover(isHovering: boolean): void {
    SwitchCursor(isHovering);

    const { toggled } = this.options;
    if (isHovering) {
      this._borderColor = toggled ? Theme.Primary : Theme.BorderMouseHover;
      this._backgroundColor = toggled
        ? Theme.BackgroundNormal
        : Theme.BackgroundMouseHover;
    } else {
      this._borderColor = toggled ? Theme.Primary : Theme.BorderNormal;
      this._backgroundColor = Theme.BackgroundNormal;
    }
  }

  @UIAction
  private OnMouseDown(): void {
    const { toggled } = this.options;
    this._backgroundColor = toggled
      ? Theme.BackgroundNormal
      : Theme.BackgroundMouseDown;
  }

  @UIAction
  private OnMouseClick(): void {
    const { value } = this.options;
    this._backgroundColor = Theme.BackgroundNormal;

    this.options.onToggle?.(value);
  }
}

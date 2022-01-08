import { Nullable } from "../../util/common";
import { Theme } from "./common/theme";
import { Length } from "./common/types";
import { SwitchCursor } from "./common/utils";
import { Reactive } from "./foundation/decorator";
import { SingleChildWidget } from "./foundation/singleChildWidget";
import { CommonWidgetOptions, SizableWidgetOptions } from "./foundation/types";
import { Widget } from "./foundation/widget";
import { MouseSensor } from "./mouseSensor";

interface RadioOptions<T> extends CommonWidgetOptions, SizableWidgetOptions {
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

  protected _Render(): Nullable<Widget> | Nullable<Widget>[] {
    return new MouseSensor({
      width: this.options.width,
      height: this.options.height,
      onHover: this.OnMouseHover,
      onKeyDown: this.OnMouseDown,
      onClick: this.OnMouseClick,
    });
  }

  protected GetHeight(): Length {
    return this.options.height || 12;
  }

  protected GetWidth(): Length {
    return this.options.width || 12;
  }

  @Reactive
  protected OnMouseHover(isHovering: boolean): void {
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

  @Reactive
  protected OnMouseDown(): void {
    const { toggled } = this.options;
    this._backgroundColor = toggled
      ? Theme.BackgroundNormal
      : Theme.BackgroundMouseDown;
  }

  @Reactive
  protected OnMouseClick(): void {
    const { value } = this.options;
    this._backgroundColor = Theme.BackgroundNormal;

    this.options.onToggle?.(value);
  }
}

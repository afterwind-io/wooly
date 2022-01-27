import { Theme } from "./common/theme";
import { Length } from "./common/types";
import { SwitchCursor } from "./common/utils";
import { Reactive } from "./foundation/decorator";
import { SingleChildWidget } from "./foundation/singleChildWidget";
import { SizableWidgetOptions, WidgetRenderables } from "./foundation/types";
import { MouseSensor } from "./mouseSensor";

interface CheckboxOptions extends SizableWidgetOptions {
  checked: boolean;
  onToggle?(isChecked: boolean): void;
}

export class Checkbox extends SingleChildWidget<CheckboxOptions> {
  public readonly name: string = "Checkbox";
  public readonly enableDrawing: boolean = true;

  protected readonly isLooseBox: boolean = false;

  protected _backgroundColor!: string;
  protected _borderColor!: string;

  protected _Ready(): void {
    const { checked } = this.options;
    this._backgroundColor = checked ? Theme.Primary : Theme.BackgroundNormal;
    this._borderColor = checked ? Theme.Primary : Theme.BorderNormal;
  }

  public _Draw(ctx: CanvasRenderingContext2D) {
    const { checked } = this.options;

    const width = this._intrinsicWidth;
    const height = this._intrinsicHeight;

    ctx.fillStyle = this._backgroundColor;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = this._borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.closePath();
    ctx.stroke();

    const half = ~~(width / 2);
    if (checked) {
      ctx.strokeStyle = "white";
      ctx.lineWidth = ~~(width / 16) + 2;
      ctx.beginPath();

      ctx.moveTo(half * 0.4, half * 1.2);
      ctx.lineTo(half * 0.9, half * 1.5);
      ctx.lineTo(half * 1.5, half * 0.5);

      ctx.stroke();
      ctx.closePath();
    }
  }

  protected _Render(): WidgetRenderables {
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

    const { checked } = this.options;
    if (isHovering) {
      this._borderColor = checked ? Theme.Primary : Theme.BorderMouseHover;
      this._backgroundColor = checked
        ? Theme.Primary
        : Theme.BackgroundMouseHover;
    } else {
      this._borderColor = checked ? Theme.Primary : Theme.BorderNormal;
      this._backgroundColor = checked ? Theme.Primary : Theme.BackgroundNormal;
    }
  }

  @Reactive
  protected OnMouseDown(): void {
    const { checked } = this.options;
    this._backgroundColor = checked ? Theme.Primary : Theme.BackgroundMouseDown;
  }

  @Reactive
  protected OnMouseClick(): void {
    const { checked } = this.options;
    this._backgroundColor = !checked ? Theme.Primary : Theme.BackgroundNormal;

    this.options.onToggle?.(!checked);
  }
}

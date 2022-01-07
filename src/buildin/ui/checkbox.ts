import { Theme } from "./common/theme";
import { Length } from "./common/types";
import { SwitchCursor } from "./common/utils";
import { SingleChildWidget } from "./foundation/singleChildWidget";
import { CommonWidgetOptions, SizableWidgetOptions } from "./foundation/types";
import { UIAction, Widget } from "./foundation/widget";
import { MouseSensor } from "./mouseSensor";

interface CheckboxOptions extends CommonWidgetOptions, SizableWidgetOptions {
  checked: boolean;
  onToggle?(isChecked: boolean): void;
}

export class Checkbox extends SingleChildWidget<CheckboxOptions> {
  public readonly name: string = "Checkbox";
  public readonly customDrawing: boolean = true;

  protected readonly isLooseBox: boolean = false;

  protected _backgroundColor: string;
  protected _borderColor: string;

  public constructor(options: CheckboxOptions) {
    super(options);

    const { checked } = this.options;
    this._backgroundColor = checked ? Theme.Primary : Theme.BackgroundNormal;
    this._borderColor = checked ? Theme.Primary : Theme.BorderNormal;

    this.OnMouseHover = this.OnMouseHover.bind(this);
    this.OnMouseDown = this.OnMouseDown.bind(this);
    this.OnMouseClick = this.OnMouseClick.bind(this);
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

  protected _Render(): Widget | Widget[] | null {
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

  @UIAction
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

  @UIAction
  protected OnMouseDown(): void {
    const { checked } = this.options;
    this._backgroundColor = checked ? Theme.Primary : Theme.BackgroundMouseDown;
  }

  @UIAction
  protected OnMouseClick(): void {
    const { checked } = this.options;
    this._backgroundColor = !checked ? Theme.Primary : Theme.BackgroundNormal;

    this.options.onToggle?.(!checked);
  }
}

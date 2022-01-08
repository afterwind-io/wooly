import { CommonWidgetOptions, SizableWidgetOptions } from "./foundation/types";
import { Align } from "./align";
import { Text } from "./text";
import { SingleChildWidget } from "./foundation/singleChildWidget";
import { Widget } from "./foundation/widget";
import { BoxDecoration } from "./boxDecoration";
import { Edge } from "./common/edge";
import { MouseSensor } from "./mouseSensor";
import { Theme } from "./common/theme";
import { SwitchCursor } from "./common/utils";
import { Length } from "./common/types";
import { Reactive } from "./foundation/decorator";

interface ButtonOptions extends CommonWidgetOptions, SizableWidgetOptions {
  label?: string;
  onClick?(): void;
}

export class Button extends SingleChildWidget<ButtonOptions> {
  public readonly name: string = "Button";

  protected readonly isLooseBox: boolean = false;

  protected _backgroundColor: string = "white";
  protected _borderColor: string = Theme.BorderNormal;

  public constructor(options: ButtonOptions = {}) {
    super(options);
  }

  protected _Render(): Widget | Widget[] | null {
    const { label = "" } = this.options;

    return new MouseSensor({
      onHover: this.OnMouseHover,
      onKeyDown: this.OnMouseDown,
      onKeyUp: this.OnMouseUp,
      onClick: this.OnMouseClick,
      child: new BoxDecoration({
        backgroundColor: this._backgroundColor,
        border: Edge.All(1),
        borderColor: this._borderColor,
        child: Align.Center({
          child: new Text({
            content: label,
          }),
        }),
      }),
    });
  }

  protected GetHeight(): Length {
    return this.options.height || "shrink";
  }

  protected GetWidth(): Length {
    return this.options.width || "shrink";
  }

  @Reactive
  private OnMouseHover(isHovering: boolean): void {
    SwitchCursor(isHovering);

    if (isHovering) {
      this._borderColor = Theme.BorderMouseHover;
      this._backgroundColor = Theme.BackgroundMouseHover;
    } else {
      this._borderColor = Theme.BorderNormal;
      this._backgroundColor = Theme.BackgroundNormal;
    }
  }

  @Reactive
  private OnMouseDown(): void {
    this._backgroundColor = Theme.BackgroundMouseDown;
  }

  @Reactive
  private OnMouseUp(): void {
    this._backgroundColor = Theme.BackgroundNormal;
  }

  @Reactive
  private OnMouseClick(): void {
    this.options.onClick?.();
  }
}

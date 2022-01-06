import { CommonWidgetOptions } from "./foundation/types";
import { Align } from "./align";
import { Text } from "./text";
import { SingleChildWidget } from "./foundation/singleChildWidget";
import { UIAction, Widget } from "./foundation/widget";
import { BoxDecoration } from "./boxDecoration";
import { Edge } from "./common/edge";
import { MouseSensor } from "./mouseSensor";
import { Theme } from "./common/theme";
import { SwitchCursor } from "./common/utils";

interface ButtonOptions extends CommonWidgetOptions {
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

    this.OnMouseHover = this.OnMouseHover.bind(this);
    this.OnMouseDown = this.OnMouseDown.bind(this);
    this.OnMouseUp = this.OnMouseUp.bind(this);
    this.OnMouseClick = this.OnMouseClick.bind(this);
  }

  protected _Render(): Widget | Widget[] | null {
    const { label = "" } = this.options;

    return new MouseSensor({
      width: this.width,
      height: this.height,
      onHover: this.OnMouseHover,
      onKeyDown: this.OnMouseDown,
      onKeyUp: this.OnMouseUp,
      onClick: this.OnMouseClick,
      child: new BoxDecoration({
        backgroundColor: this._backgroundColor,
        border: Edge.All(1),
        borderColor: this._borderColor,
        child: Align.Center({
          width: "stretch",
          height: "stretch",
          child: new Text({
            content: label,
          }),
        }),
      }),
    });
  }

  @UIAction
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

  @UIAction
  private OnMouseDown(): void {
    this._backgroundColor = Theme.BackgroundMouseDown;
  }

  @UIAction
  private OnMouseUp(): void {
    this._backgroundColor = Theme.BackgroundNormal;
  }

  @UIAction
  private OnMouseClick(): void {
    this.options.onClick?.();
  }
}

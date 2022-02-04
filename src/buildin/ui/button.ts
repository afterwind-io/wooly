import { SizableWidgetOptions } from "./foundation/types";
import { Text } from "./text";
import { Edge } from "./common/edge";
import { MouseSensor } from "./mouseSensor";
import { Theme } from "./common/theme";
import { SwitchCursor } from "./common/utils";
import { Reactive } from "./foundation/decorator";
import { CompositeWidget } from "./foundation/compositeWidget";
import { Widget } from "./foundation/widget";
import { Blackhole } from "../../util/common";
import { Box } from "./box";

interface ButtonOptions extends SizableWidgetOptions {
  label?: string;
  onClick?(): void;
  padding?: Edge;
}

export class Button extends CompositeWidget<ButtonOptions> {
  public readonly name: string = "Button";

  protected readonly isLooseBox: boolean = false;

  protected _backgroundColor: string = "white";
  protected _borderColor: string = Theme.BorderNormal;

  protected _Render(): Widget | null {
    const { width, height, padding, label } = this
      .options as Required<ButtonOptions>;

    return new MouseSensor({
      onHover: this.OnMouseHover,
      onKeyDown: this.OnMouseDown,
      onKeyUp: this.OnMouseUp,
      onClick: this.OnMouseClick,
      child: new Box({
        width,
        height,
        backgroundColor: this._backgroundColor,
        border: Edge.All(1),
        borderColor: this._borderColor,
        padding,
        child: new Text({
          content: label,
        }),
      }),
    });
  }

  protected NormalizeOptions(options: ButtonOptions): ButtonOptions {
    return {
      ...options,
      width: options.width ?? "shrink",
      height: options.height ?? "shrink",
      padding: options.padding || Edge.All(8),
      label: options.label || "",
      onClick: options.onClick || Blackhole,
    };
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
    this.options.onClick!();
  }
}

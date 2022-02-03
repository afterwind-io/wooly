import { CanvasManager } from "../../core/manager/canvas";
import { Align, Alignment } from "./align";
import { Length } from "./common/types";
import { SwitchCursor } from "./common/utils";
import { BindThis, Reactive } from "./foundation/decorator";
import { SingleChildWidget } from "./foundation/singleChildWidget";
import { SizableWidgetOptions, WidgetElement } from "./foundation/types";
import { MouseSensor } from "./mouseSensor";
import { Opacity } from "./opacity";
import { Text } from "./text";

interface TextInputOptions extends SizableWidgetOptions {
  value: string;
  placeholder?: string;
  onChange(value: string): void;
  color?: string;
  fontName?: string;
  fontSize?: number;
  fontWeight?: number;
}

/**
 * A wrapper around native HTML Input element.
 *
 * TODO
 * 未考虑父级元素发生形变的场景（旋转、缩放）
 */
export class TextInput extends SingleChildWidget<TextInputOptions> {
  public readonly name: string = "TextInput";

  protected readonly isLooseBox: boolean = false;

  private $inputElement!: HTMLInputElement;
  private _isFocused: boolean = false;

  protected _Ready(): void {
    const input = document.createElement("input");

    input.style.position = "absolute";
    input.style.border = "none";
    input.style.outline = "none";
    input.style.background = "none";
    input.style.display = "none";

    input.onchange = this.OnInputChange;
    input.onblur = this.OnInputBlur;

    CanvasManager.container.appendChild(input);
    this.$inputElement = input;
  }

  protected _Destroy(): void {
    this.$inputElement.onchange = null;

    CanvasManager.container.removeChild(this.$inputElement);

    // @ts-expect-error TS2322 clear reference
    this.$inputElement = null;
  }

  protected GetHeight(): Length {
    return this.options.height!;
  }

  protected GetWidth(): Length {
    return this.options.width!;
  }

  protected NormalizeOptions(options: TextInputOptions): TextInputOptions {
    return {
      width: "stretch",
      height: "stretch",
      color: "black",
      fontName: "",
      fontSize: 12,
      fontWeight: 400,
      placeholder: "",
      ...options,
    };
  }

  @Reactive
  private OnFocus(): void {
    this.LayoutInputElement();

    this.$inputElement.style.display = "block";
    this.$inputElement.focus();

    this._isFocused = true;
  }

  @BindThis
  private OnHover(isHovering: boolean): void {
    SwitchCursor(isHovering && !this._isFocused, "text");
  }

  @BindThis
  private OnInputChange(): void {
    // 屏蔽因为blur触发的change事件
    if (document.activeElement !== this.$inputElement) {
      return;
    }

    this.options.onChange(this.$inputElement.value);
  }

  @Reactive
  private OnInputBlur(): void {
    this.$inputElement.style.display = "none";

    this._isFocused = false;
  }

  private LayoutInputElement(): void {
    const inputElement = this.$inputElement;

    inputElement.style.width = `${this._intrinsicWidth}px`;
    inputElement.style.height = `${this._intrinsicHeight}px`;

    // FIXME 只有Layout阶段之后才能拿到Input的真实位置，理论上应该在某个特定生命周期钩子处理
    const { x, y } = this.ConvertToScreenPosition(this.position);
    inputElement.style.left = `${x}px`;
    inputElement.style.top = `${y}px`;
  }

  protected _Render(): WidgetElement {
    const { value, placeholder, color, fontName, fontSize, fontWeight } = this
      .options as Required<TextInputOptions>;

    const inputElement = this.$inputElement;
    inputElement.value = value;
    inputElement.style.color = color;
    inputElement.style.fontFamily = fontName;
    inputElement.style.fontSize = `${fontSize}px`;
    inputElement.style.fontWeight = `${fontWeight}`;

    const { width, height } = this.options as Required<TextInputOptions>;
    const placeholderWidget = !this._isFocused
      ? new Align({
          alignment: Alignment.Left,
          width,
          height,
          child: new Opacity({
            opacity: 0.5,
            child: new Text({
              content: placeholder,
              fillStyle: color,
              fontName: fontName,
              fontSize: fontSize,
              fontWeight: fontWeight,
            }),
          }),
        })
      : null;
    return new MouseSensor({
      width,
      height,
      onClick: this.OnFocus,
      onHover: this.OnHover,
      child: placeholderWidget,
    });
  }
}

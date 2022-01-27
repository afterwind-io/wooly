import { CanvasManager } from "../../core/manager/canvas";
import { Length } from "./common/types";
import { BindThis } from "./foundation/decorator";
import { SingleChildWidget } from "./foundation/singleChildWidget";
import { SizableWidgetOptions, WidgetElement } from "./foundation/types";
import { MouseSensor } from "./mouseSensor";

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
  public readonly enableDrawing: boolean = true;

  protected readonly isLooseBox: boolean = false;

  private _inputElement!: HTMLInputElement;

  protected _Ready(): void {
    const input = document.createElement("input");

    input.style.position = "absolute";
    input.style.border = "none";
    input.style.outline = "none";
    input.style.background = "none";

    // 初始挂载暂时隐藏，避免元素闪动
    input.style.display = "none";

    input.onchange = this.OnInputChange;

    CanvasManager.container.appendChild(input);
    this._inputElement = input;
  }

  protected _Destroy(): void {
    this._inputElement.onchange = null;

    CanvasManager.container.removeChild(this._inputElement);

    // @ts-expect-error TS2322 clear reference
    this._inputElement = null;
  }

  public _Draw(ctx: CanvasRenderingContext2D): void {
    const inputElement = this._inputElement;

    // FIXME 是否显示input理论上需要检查:
    // - 当前元素是否显示在canvas上
    // - 当前元素是否被composition裁剪
    inputElement.style.display = this.globalVisible ? "block" : "none";

    const width = this._intrinsicWidth;
    const height = this._intrinsicHeight;
    inputElement.style.width = `${width}px`;
    inputElement.style.height = `${height}px`;

    // FIXME 只有Draw阶段才能拿到Input的真实位置，理论上应该在某个特定生命周期钩子处理
    const { x, y } = this.ConvertToScreenPosition(this.position);
    inputElement.style.left = `${x}px`;
    inputElement.style.top = `${y}px`;
  }

  protected GetHeight(): Length {
    return this.options.height || "stretch";
  }

  protected GetWidth(): Length {
    return this.options.width || "stretch";
  }

  protected NormalizeOptions(options: TextInputOptions): TextInputOptions {
    return {
      color: "black",
      fontName: "",
      fontSize: 12,
      fontWeight: 400,
      placeholder: "",
      ...options,
    };
  }

  @BindThis
  private OnInputChange(): void {
    const inputElement = this._inputElement;

    // 屏蔽因为blur触发的change事件
    if (document.activeElement !== inputElement) {
      return;
    }

    this.options.onChange(inputElement.value);
  }

  protected _Render(): WidgetElement {
    const { value, placeholder, color, fontName, fontSize, fontWeight } = this
      .options as Required<TextInputOptions>;

    const inputElement = this._inputElement;
    inputElement.value = value;
    inputElement.placeholder = placeholder;
    inputElement.style.color = color;
    inputElement.style.fontFamily = fontName;
    inputElement.style.fontSize = `${fontSize}px`;
    inputElement.style.fontWeight = `${fontWeight}`;

    const { width, height } = this.options as Required<TextInputOptions>;
    return new MouseSensor({
      width,
      height,
      onClick: () => {
        this._inputElement.focus();
      },
    });
  }
}

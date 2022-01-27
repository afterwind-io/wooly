import { SingleChildWidget } from "../ui/foundation/singleChildWidget";
import { Input } from "../media/input";
import { Container } from "../ui/container";
import { Edge } from "../ui/common/edge";
import { Checkbox } from "../ui/checkbox";
import { Text } from "../ui/text";
import { Entity } from "../../core/entity";
import { CanvasLayer } from "../../core/canvasLayer";
import { Vector2 } from "../../util/vector2";
import { CanvasManager } from "../../core/manager/canvas";
import { Widget } from "../ui/foundation/widget";
import { Length } from "../ui/common/types";
import { Row } from "../ui/flex/flex";
import { Reactive } from "../ui/foundation/decorator";
import { WidgetRenderables } from "../ui/foundation/types";

export class InspectorMouseIndicator extends SingleChildWidget {
  public readonly name: string = "InspectorMouseIndicator";

  protected readonly isLooseBox: boolean = false;

  private $indicator!: MouseIndicator;
  private isEnabled: boolean = true;

  public constructor() {
    super({});
  }

  protected _Ready(): void {
    const layer = new CanvasLayer(10000);
    layer.AddChild((this.$indicator = new MouseIndicator()));
    this.AddChild(layer);
  }

  protected _Render(): WidgetRenderables {
    return Container.Shrink({
      margin: Edge.Bottom(4),
      child: Row.Shrink({
        children: [
          Container.Shrink({
            margin: Edge.Right(4),
            child: new Checkbox({
              width: 12,
              height: 12,
              checked: this.isEnabled,
              onToggle: this.Toggle,
            }),
          }),
          new Text({
            content: "Mouse Indicator",
          }),
        ],
      }),
    });
  }

  protected GetFirstChild(): Widget | null {
    return this.children[1] as Widget;
  }

  protected GetHeight(): Length {
    return "shrink";
  }

  protected GetWidth(): Length {
    return "shrink";
  }

  @Reactive
  private Toggle(isEnabled: boolean): void {
    this.isEnabled = isEnabled;
    this.$indicator.enabled = isEnabled;
  }
}

class MouseIndicator extends Entity {
  public readonly name: string = "MouseIndicator";
  public readonly enableDrawing: boolean = true;

  private _x: number = 0;
  private _y: number = 0;

  public _Draw(ctx: CanvasRenderingContext2D) {
    if (!this.enabled) {
      return;
    }

    const x = this._x;
    const y = this._y;

    const pos = `${x}, ${y}`;

    // Draw cross
    ctx.fillStyle = "magenta";
    ctx.fillRect(x, y - 16, 1, 32);
    ctx.fillRect(x - 16, y, 32, 1);

    const textWidth = ctx.measureText(pos).width;
    const anchor = this.GetLabelAnchor(x, y, textWidth);

    // Draw label background
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(anchor.x, anchor.y, textWidth + 8, -14);

    // Draw label text
    ctx.fillStyle = "grey";
    ctx.textBaseline = "bottom";
    ctx.font = "10px";
    ctx.fillText(pos, anchor.x + 4, anchor.y - 2);
  }

  public _Update(delta: number) {
    super._Update(delta);

    const { x, y } = Input.GetMousePosition();
    this._x = x;
    this._y = y;
  }

  private GetLabelAnchor(
    mouseX: number,
    mouseY: number,
    textWidth: number
  ): Vector2 {
    const dimension = CanvasManager.Dimension;

    let _x: number, _y: number;

    if (dimension.x - mouseX < 60) {
      _x = mouseX - 4 - (textWidth + 8);
    } else {
      _x = mouseX + 4;
    }

    if (mouseY < 20) {
      _y = mouseY + 5 + 14;
    } else {
      _y = mouseY - 5;
    }

    return new Vector2(_x, _y);
  }
}

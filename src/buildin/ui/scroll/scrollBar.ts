import { DragDropState } from "../../../core/manager/input";
import { Vector2 } from "../../../util/vector2";
import { Input } from "../../media/input";
import { Constraint } from "../common/constraint";
import { Size } from "../common/types";
import { SwitchCursor } from "../common/utils";
import { BindThis } from "../foundation/decorator";
import { WidgetElement } from "../foundation/types";
import { Widget } from "../foundation/widget";
import { MouseSensor } from "../mouseSensor";
import { ScrollDirection } from "./types";

export const BAR_SIZE = 6;
export const BAR_MIN_LENGTH = 16;
const BAR_RADIUS = BAR_SIZE / 2;

interface ScrollBarOptions {
  direction: ScrollDirection;
  onScroll(direction: ScrollDirection, delta: number): void;
}

export class ScrollBar extends Widget<ScrollBarOptions> {
  public readonly name: string = "ScrollBar";
  public readonly enableDrawing: boolean = true;
  public readonly childSizeIndependent: boolean = true;

  public barLength: number = 0;
  public barOffset: number = 0;
  public trackLength: number = 0;

  private _prevDragPosition: Vector2 = Vector2.Zero;
  private _isDragging: boolean = false;
  private _isFocused: boolean = false;

  public _Draw(ctx: CanvasRenderingContext2D) {
    const { direction } = this.options;
    const { trackLength, barOffset, barLength } = this;

    ctx.globalAlpha = this._isFocused || this._isDragging ? 1 : 0.5;

    // 轨道
    ctx.fillStyle = "#EAEAEA";
    if (direction === "horizontal") {
      ctx.fillRect(0, 0, trackLength, BAR_SIZE);
    } else {
      ctx.fillRect(0, 0, BAR_SIZE, trackLength);
    }

    // 控制柄
    ctx.fillStyle = "#7D7D7D";
    ctx.beginPath();
    if (direction === "horizontal") {
      ctx.arc(
        barOffset + BAR_RADIUS,
        BAR_RADIUS,
        BAR_RADIUS,
        Math.PI * 0.5,
        Math.PI * 1.5
      );
      ctx.lineTo(barOffset + barLength - BAR_RADIUS, 0);
      ctx.arc(
        barOffset + barLength - BAR_RADIUS,
        BAR_RADIUS,
        BAR_RADIUS,
        Math.PI * 1.5,
        Math.PI * 2.5
      );
    } else {
      ctx.arc(
        BAR_RADIUS,
        barOffset + BAR_RADIUS,
        BAR_RADIUS,
        Math.PI,
        Math.PI * 2
      );
      ctx.lineTo(BAR_SIZE, barOffset + barLength - BAR_RADIUS);
      ctx.arc(
        BAR_RADIUS,
        barOffset + barLength - BAR_RADIUS,
        BAR_RADIUS,
        0,
        Math.PI
      );
    }
    ctx.fill();
    ctx.closePath();

    ctx.globalAlpha = 1;
  }

  protected _Layout(): Size {
    const child = this.GetFirstChild()!;

    const { direction } = this.options;
    if (direction === "horizontal") {
      child.$Layout(Constraint.Tight(this.barLength, BAR_SIZE));
      child.position = new Vector2(this.barOffset, 0);
    } else {
      child.$Layout(Constraint.Tight(BAR_SIZE, this.barLength));
      child.position = new Vector2(0, this.barOffset);
    }

    return { width: 0, height: 0 };
  }

  protected _Render(): WidgetElement {
    return new MouseSensor({
      width: "stretch",
      height: "stretch",
      draggable: true,
      onHover: this.OnHover,
      onDragStart: this.OnDragStart,
      onDragMove: this.OnDragMove,
      onDragEnd: this.OnDragEnd,
    });
  }

  @BindThis
  private OnHover(isHovering: boolean): void {
    SwitchCursor(isHovering || this._isDragging);

    this._isFocused = isHovering;
  }

  @BindThis
  private OnDragStart(state: DragDropState): void {
    this._isDragging = true;
    this._prevDragPosition = Input.GetMousePosition(this.scope);
  }

  @BindThis
  private OnDragMove(): void {
    const currentPosition = Input.GetMousePosition(this.scope);
    const prevPosition = this._prevDragPosition;

    const direction = this.options.direction;
    let delta: number;
    if (direction === "horizontal") {
      delta = currentPosition.x - prevPosition.x;
    } else {
      delta = currentPosition.y - prevPosition.y;
    }

    this._prevDragPosition = currentPosition;
    this.options.onScroll(direction, delta);
  }

  @BindThis
  private OnDragEnd(): void {
    SwitchCursor(this._isFocused || false);

    this._isDragging = false;
  }
}

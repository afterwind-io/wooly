import { Align, Alignment } from "../../ui/align";
import { BoxDecoration } from "../../ui/boxDecoration";
import { Edge } from "../../ui/common/edge";
import { Column, Flex } from "../../ui/flex/flex";
import { CompositeWidget } from "../../ui/foundation/compositeWidget";
import {
  SingleChildWidgetOptions,
  SizableWidgetOptions,
} from "../../ui/foundation/types";
import { Text } from "../../ui/text";
import { Widget } from "../../ui/foundation/widget";
import { MouseSensor } from "../../ui/mouseSensor";
import { BindThis, Reactive } from "../../ui/foundation/decorator";
import { Vector2 } from "../../../util/vector2";
import { DragDropState, EntityInputEvent } from "../../../core/manager/input";
import { ThemeContext } from "./theme";
import { Stack } from "../../ui/stack";
import { SwitchCursor } from "../../ui/common/utils";
import { Box } from "../../ui/box";

interface ModalOptions extends SingleChildWidgetOptions, SizableWidgetOptions {
  title: string;
}

export class Modal extends CompositeWidget<ModalOptions> {
  public readonly name: string = "Modal";
  public readonly enableInputEvents: boolean = true;

  private _prevPosition!: Vector2;
  private _hasSizeChanged: boolean = false;
  private _size!: Vector2;
  private _prevSize!: Vector2;

  public _Input(event: EntityInputEvent): false | void {
    return false;
  }

  @BindThis
  private OnDragHover(isHovering: boolean): void {
    SwitchCursor(isHovering, "grab");
  }

  @BindThis
  private OnDragStart(): void {
    this._prevPosition = this.position;
  }

  @BindThis
  private OnDragMove(state: DragDropState): void {
    SwitchCursor(true, "grabbing");
    this.position = this._prevPosition.Add(state.dragOffset);
  }

  @BindThis
  private OnDragEnd(): void {
    SwitchCursor(true, "grab");
    this._prevPosition = this.position;
  }

  @BindThis
  private OnResizeHover(isHovering: boolean): void {
    SwitchCursor(isHovering, "nwse-resize");
  }

  @BindThis
  private OnResizeStart(): void {
    this._size = new Vector2(this._intrinsicWidth, this._intrinsicHeight);
    this._prevSize = this._size;
    this._hasSizeChanged = true;
  }

  @Reactive
  private OnResizeMove(state: DragDropState): void {
    SwitchCursor(true, "nwse-resize");
    this._size = this._prevSize.Add(state.dragOffset);
  }

  protected _Render(): Widget | null {
    const { width, height, title, child } = this
      .options as Required<ModalOptions>;

    const { colorTextNormal } = ThemeContext.Of(this);

    let realWidth = width;
    let realHeight = height;
    if (this._hasSizeChanged) {
      realWidth = this._size.x;
      realHeight = this._size.y;
    }

    return new BoxDecoration({
      tag: "ModalBackground",
      width: realWidth,
      height: realHeight,
      backgroundColor: ThemeContext.Of(this).backgroundL4,
      shadows: [
        {
          color: "rgb(0 0 0 / 20%)",
          blur: 4,
          offsetY: 2,
        },
        {
          color: "rgb(0 0 0 / 10%)",
          blur: 50,
          offsetY: 25,
        },
      ],
      child: new Stack({
        children: [
          Column.Stretch({
            children: [
              // 标题栏
              new MouseSensor({
                width: "stretch",
                height: 36,
                draggable: true,
                onHover: this.OnDragHover,
                onDragStart: this.OnDragStart,
                onDragMove: this.OnDragMove,
                onDragEnd: this.OnDragEnd,
                child: new Box({
                  padding: Edge.Horizontal(16),
                  alignment: Alignment.Left,
                  child: new Text({
                    content: title,
                    fontSize: 12,
                    fillStyle: colorTextNormal,
                  }),
                }),
              }),

              // 窗口本体
              Flex.Expanded({
                child,
              }),
            ],
          }),

          // 缩放控制柄
          new Align({
            alignment: Alignment.BottomRight,
            child: new MouseSensor({
              tag: "ResizeHandler",
              width: 8,
              height: 8,
              draggable: true,
              onHover: this.OnResizeHover,
              onDragStart: this.OnResizeStart,
              onDragMove: this.OnResizeMove,
            }),
          }),
        ],
      }),
    });
  }

  protected NormalizeOptions(options: ModalOptions): ModalOptions {
    return {
      width: "shrink",
      height: "shrink",
      ...options,
    };
  }
}

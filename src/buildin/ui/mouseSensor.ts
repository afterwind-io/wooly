import { DragDropState, EntityInputEvent } from "../../core/manager/input";
import { Blackhole } from "../../util/common";
import { Length } from "./common/types";
import { SingleChildWidget } from "./foundation/singleChildWidget";
import {
  SingleChildWidgetOptions,
  SizableWidgetOptions,
} from "./foundation/types";
import { Widget } from "./foundation/widget";

type BaseOptions = Partial<SingleChildWidgetOptions> & SizableWidgetOptions;

interface MouseSensorOptions extends BaseOptions {
  /**
   * 是否允许被拖曳？
   *
   * @default false
   */
  draggable?: boolean;
  /**
   * 是否允许成为拖放目标？
   *
   * @default false
   */
  droppable?: boolean;
  onKeyDown?(): false | void;
  onKeyUp?(): false | void;
  onClick?(): false | void;
  onHover?(isHovering: boolean): false | void;
  onEnter?(): false | void;
  onLeave?(): false | void;
  /**
   * 当前对象开始被拖曳
   *
   * @param state 全局拖曳状态对象
   */
  onDragStart?(state: DragDropState): false | void;
  /**
   * 当前对象正在被拖曳
   *
   * @param state 全局拖曳状态对象
   */
  onDragMove?(state: DragDropState): false | void;
  /**
   * 当前对象的拖曳被释放
   */
  onDragEnd?(): false | void;
  /**
   * 某个对象被拖入
   *
   * @param state 全局拖曳状态对象
   */
  onDragEnter?(state: DragDropState): false | void;
  /**
   * 某个对象正在当前对象的范围内拖曳
   *
   * @param state 全局拖曳状态对象
   */
  onDragOver?(state: DragDropState): false | void;
  /**
   * 某个对象被拖出
   */
  onDragLeave?(): false | void;
  /**
   * 某个拖曳对象在当前对象上被释放
   *
   * @param state 全局拖曳状态对象
   */
  onDrop?(state: DragDropState): false | void;
}

/**
 *  A widget provides basic mouse action detections.
 */
export class MouseSensor extends SingleChildWidget<MouseSensorOptions> {
  public readonly name: string = "MouseSensor";
  public readonly enableInputEvents: boolean = true;

  protected readonly isLooseBox: boolean = false;

  public _Input(event: EntityInputEvent): false | void {
    const {
      onKeyDown,
      onKeyUp,
      onClick,
      onHover,
      onEnter,
      onLeave,
      onDragStart,
      onDragMove,
      onDragEnd,
      onDragEnter,
      onDragOver,
      onDragLeave,
      onDrop,
    } = this.options as Required<MouseSensorOptions>;

    switch (event.type) {
      case "MouseKeyDown":
        return onKeyDown();
      case "MouseKeyUp":
        return onKeyUp();
      case "MouseClick":
        return onClick();
      case "MouseEnter": {
        const p1 = onEnter();
        const p2 = onHover(true);
        return p1 ?? p2;
      }
      case "MouseLeave": {
        const p1 = onLeave();
        const p2 = onHover(false);
        return p1 ?? p2;
      }
      case "DragStart":
        return onDragStart(event.dragDropState);
      case "DragMove":
        return onDragMove(event.dragDropState);
      case "DragEnd":
        return onDragEnd();
      case "DragEnter":
        return onDragEnter(event.dragDropState);
      case "DragOver":
        return onDragOver(event.dragDropState);
      case "DragLeave":
        return onDragLeave();
      case "Drop":
        return onDrop(event.dragDropState);

      default:
        break;
    }
  }

  protected _Render(): Widget | null {
    const { draggable, droppable, child } = this
      .options as Required<MouseSensorOptions>;

    this.draggable = draggable;
    this.droppable = droppable;

    return child;
  }

  protected GetHeight(): Length {
    return this.options.height!;
  }

  protected GetWidth(): Length {
    return this.options.width!;
  }

  protected NormalizeOptions(options: MouseSensorOptions): MouseSensorOptions {
    return {
      width: "shrink",
      height: "shrink",
      draggable: false,
      droppable: false,
      onKeyDown: Blackhole,
      onKeyUp: Blackhole,
      onClick: Blackhole,
      onHover: Blackhole,
      onEnter: Blackhole,
      onLeave: Blackhole,
      onDragStart: Blackhole,
      onDragMove: Blackhole,
      onDragEnd: Blackhole,
      onDragEnter: Blackhole,
      onDragOver: Blackhole,
      onDragLeave: Blackhole,
      onDrop: Blackhole,
      ...options,
    };
  }
}

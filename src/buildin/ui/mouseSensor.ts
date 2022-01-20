import { Entity } from "../../core/entity";
import { Blackhole } from "../../util/common";
import { ReadonlyVector2, Vector2 } from "../../util/vector2";
import { Input } from "../media/input";
import { Length } from "./common/types";
import { SingleChildWidget } from "./foundation/singleChildWidget";
import {
  CommonWidgetOptions,
  MouseAction,
  MouseDragDrop,
  MouseMovement,
  SingleChildWidgetOptions,
  SizableWidgetOptions,
  WidgetRenderables,
} from "./foundation/types";

const DRAG_START_THRESHOLD = 3;

const DragDropState = new (class DragDropState {
  private data: any = null;
  private dragStartPosition: ReadonlyVector2 = new Vector2();
  private source: Entity | null = null;

  public get isDragging(): boolean {
    return this.source != null;
  }

  public get isDragStart(): boolean {
    return this.delta >= DRAG_START_THRESHOLD;
  }

  public get delta(): number {
    const currentPosition = Input.GetMousePosition();
    return this.dragStartPosition.DistanceTo(currentPosition);
  }

  public ClearSource(): void {
    this.source = null;
  }

  public ClearData(): void {
    this.data = null;
  }

  public GetData(): any {
    return this.data;
  }

  public SetData(data: any = null): void {
    this.data = data;
  }

  public SetDragStartPoint(): void {
    this.dragStartPosition = Input.GetMousePosition();
  }

  public SetSource(source: Entity): void {
    this.source = source;
  }
})();

export type DragDropState = typeof DragDropState;

type BaseOptions = CommonWidgetOptions &
  Partial<SingleChildWidgetOptions> &
  SizableWidgetOptions;

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
  onKeyDown?(): void;
  onKeyUp?(): void;
  onClick?(): void;
  onHover?(isHovering: boolean): void;
  onEnter?(): void;
  onLeave?(): void;
  /**
   * 当前对象开始被拖曳
   *
   * @param state 全局拖曳状态对象
   */
  onDragStart?(state: typeof DragDropState): void;
  /**
   * 当前对象正在被拖曳
   *
   * @param state 全局拖曳状态对象
   */
  onDragMove?(state: typeof DragDropState): void;
  /**
   * 当前对象的拖曳被释放
   */
  onDragEnd?(): void;
  /**
   * 某个对象被拖入
   *
   * @param state 全局拖曳状态对象
   */
  onDragEnter?(state: typeof DragDropState): void;
  /**
   * 某个对象正在当前对象的范围内拖曳
   *
   * @param state 全局拖曳状态对象
   */
  onDragOver?(state: typeof DragDropState): void;
  /**
   * 某个对象被拖出
   */
  onDragLeave?(): void;
  /**
   * 某个拖曳对象在当前对象上被释放
   *
   * @param state 全局拖曳状态对象
   */
  onDrop?(state: typeof DragDropState): void;
}

/**
 *  A widget provides basic mouse action detections.
 */
export class MouseSensor extends SingleChildWidget<MouseSensorOptions> {
  public readonly name: string = "MouseSensor";

  protected readonly isLooseBox: boolean = false;

  private mouseActionState: MouseAction = MouseAction.None;
  private mouseDragDropState: MouseDragDrop = MouseDragDrop.None;
  private mouseMovementState: MouseMovement = MouseMovement.None;

  public constructor(options: MouseSensorOptions) {
    super(options);
  }

  public _Update(delta: number): void {
    const isMouseDown = Input.IsMouseDown(Input.BUTTON_LEFT);
    const isMouseWithin = this.HitTest(
      this._intrinsicWidth,
      this._intrinsicHeight
    );

    this.mouseMovementState = this.StepMouseMovementState(isMouseWithin);
    this.mouseActionState = this.StepMouseActionState(
      isMouseWithin,
      isMouseDown
    );
    this.mouseDragDropState = this.StepMouseDragDropState(
      isMouseWithin,
      isMouseDown
    );
  }

  protected _Render(): WidgetRenderables {
    return this.options.child || null;
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

  private StepMouseActionState(
    isMouseWithin: boolean,
    isMouseDown: boolean
  ): MouseAction {
    const { onKeyDown, onKeyUp, onClick } = this
      .options as Required<MouseSensorOptions>;

    if (!isMouseWithin) {
      return MouseAction.None;
    }

    switch (this.mouseActionState) {
      case MouseAction.None: {
        if (isMouseDown) {
          onKeyDown();
          return MouseAction.MouseDown;
        }

        return MouseAction.None;
      }

      case MouseAction.MouseDown: {
        if (isMouseDown) {
          onKeyDown();
          return MouseAction.MouseDown;
        }

        onKeyUp();
        return MouseAction.MouseUp;
      }

      case MouseAction.MouseUp:
        onClick();
        return MouseAction.MouseClick;

      case MouseAction.MouseClick:
        return MouseAction.None;

      default:
        return MouseAction.None;
    }
  }

  private StepMouseDragDropState(
    isMouseWithin: boolean,
    isMouseDown: boolean
  ): MouseDragDrop {
    const {
      draggable,
      droppable,
      onDragStart,
      onDragMove,
      onDragEnd,
      onDragEnter,
      onDragOver,
      onDragLeave,
      onDrop,
    } = this.options as Required<MouseSensorOptions>;

    switch (this.mouseDragDropState) {
      case MouseDragDrop.None: {
        if (!isMouseWithin || !isMouseDown) {
          return MouseDragDrop.None;
        }

        if (DragDropState.isDragging) {
          if (droppable) {
            onDragEnter(DragDropState);
            return MouseDragDrop.DragEnter;
          }

          return MouseDragDrop.None;
        }

        if (draggable) {
          DragDropState.SetDragStartPoint();
          return MouseDragDrop.DragPending;
        }

        return MouseDragDrop.None;
      }

      case MouseDragDrop.DragPending: {
        if (!isMouseWithin || !isMouseDown) {
          return MouseDragDrop.None;
        }

        if (DragDropState.isDragStart) {
          DragDropState.SetSource(this);
          onDragStart(DragDropState);
          return MouseDragDrop.DragStart;
        }

        return MouseDragDrop.DragPending;
      }

      case MouseDragDrop.DragStart:
      case MouseDragDrop.DragMove: {
        if (isMouseDown) {
          onDragMove(DragDropState);
          return MouseDragDrop.DragMove;
        }

        onDragEnd();
        return MouseDragDrop.DragEnd;
      }

      case MouseDragDrop.DragEnd:
        DragDropState.ClearSource();
        return MouseDragDrop.None;

      case MouseDragDrop.DragEnter:
      case MouseDragDrop.DragOver: {
        if (!isMouseDown) {
          onDrop(DragDropState);
          return MouseDragDrop.Drop;
        }

        if (!isMouseWithin) {
          onDragLeave();
          return MouseDragDrop.DragLeave;
        }

        onDragOver(DragDropState);
        return MouseDragDrop.DragOver;
      }

      case MouseDragDrop.DragLeave:
        return MouseDragDrop.None;

      case MouseDragDrop.Drop:
        DragDropState.ClearData();
        return MouseDragDrop.None;

      default:
        return MouseDragDrop.None;
    }
  }

  private StepMouseMovementState(isMouseWithin: boolean): MouseMovement {
    const { onHover, onEnter, onLeave } = this
      .options as Required<MouseSensorOptions>;

    switch (this.mouseMovementState) {
      case MouseMovement.None: {
        if (isMouseWithin) {
          onEnter();
          onHover(true);
          return MouseMovement.MouseEnter;
        }

        return MouseMovement.None;
      }

      case MouseMovement.MouseEnter: {
        if (!isMouseWithin) {
          onLeave();
          onHover(false);
          return MouseMovement.MouseLeave;
        }

        return MouseMovement.MouseHover;
      }

      case MouseMovement.MouseHover: {
        if (!isMouseWithin) {
          onLeave();
          onHover(false);
          return MouseMovement.MouseLeave;
        }

        return MouseMovement.MouseHover;
      }

      case MouseMovement.MouseLeave: {
        if (isMouseWithin) {
          onEnter();
          onHover(true);
          return MouseMovement.MouseEnter;
        }

        return MouseMovement.None;
      }

      default:
        return MouseMovement.None;
    }
  }
}

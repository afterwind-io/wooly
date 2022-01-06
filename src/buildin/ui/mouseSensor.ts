import { Entity } from "../../core/entity";
import { Blackhole } from "../../util/common";
import { Vector2 } from "../../util/vector2";
import { Input } from "../media/input";
import { SingleChildWidget } from "./foundation/singleChildWidget";
import {
  CommonWidgetOptions,
  MouseAction,
  MouseDragDrop,
  MouseMovement,
  SingleChildWidgetOptions,
} from "./foundation/types";
import { Widget } from "./foundation/widget";

const DRAG_START_THRESHOLD = 10;

const DragDropState = new (class DragDropState {
  public data: any = null;
  public dragStartPos: Vector2 = new Vector2();
  public source: Entity | null = null;

  public get IsDragging(): boolean {
    return this.source != null;
  }

  public Clear() {
    this.source = null;
    this.data = null;
  }

  public IsStartDragging(pos: Vector2): boolean {
    return this.dragStartPos.DistanceTo(pos) >= DRAG_START_THRESHOLD;
  }

  public SetData(source: Entity, data: any = null) {
    this.source = source;
    this.data = data;
  }

  public SetDragStartPoint(pos: Vector2) {
    this.dragStartPos = pos;
  }

  public GetData(): any {
    return this.data;
  }
})();

interface MouseSensorOptions
  extends CommonWidgetOptions,
    SingleChildWidgetOptions {
  onKeyDown?(): void;
  onKeyUp?(): void;
  onClick?(): void;
  onHover?(isHovering: boolean): void;
  onEnter?(): void;
  onLeave?(): void;
}

/**
 * [**WIP**]
 *
 * @todo Drag n Drop
 */
export class MouseSensor extends SingleChildWidget<MouseSensorOptions> {
  public readonly name: string = "MouseSensor";

  protected readonly isLooseBox: boolean = false;

  protected draggable: boolean = false;
  protected mouseActionState: MouseAction = MouseAction.None;
  protected mouseDragDropState: MouseDragDrop = MouseDragDrop.None;
  protected mouseMovementState: MouseMovement = MouseMovement.None;

  public constructor(options: MouseSensorOptions) {
    super(options);
  }

  public get isDragging(): boolean {
    return DragDropState.source === this;
  }

  public _Update(delta: number): void {
    const nextMovementState = this.StepMouseMovementState();
    this.mouseMovementState = nextMovementState;

    const nextActionState = this.StepMouseActionState();
    this.mouseActionState = nextActionState;

    if (this.draggable) {
      // NOTE 应始终在移动和点击状态更新后执行
      this.HandleDragDrop();
    }
  }

  protected _Render(): Widget | Widget[] | null {
    return this.childWidgets;
  }

  private HandleDragDrop() {
    this.mouseDragDropState = this.StepMouseDragDropState();

    if (this.mouseDragDropState === MouseDragDrop.DragFocus) {
      DragDropState.SetDragStartPoint(Input.GetMousePosition());
    } else if (this.mouseDragDropState === MouseDragDrop.DragStart) {
      DragDropState.SetData(this);
    } else if (this.mouseDragDropState === MouseDragDrop.DragEnd) {
      DragDropState.Clear();
    }
  }

  private StepMouseActionState() {
    const {
      onKeyDown = Blackhole,
      onKeyUp = Blackhole,
      onClick = Blackhole,
    } = this.options;

    if (this.mouseMovementState === MouseMovement.None) {
      return MouseAction.None;
    }

    switch (this.mouseActionState) {
      case MouseAction.None:
        if (Input.IsMouseDown(Input.BUTTON_LEFT)) {
          onKeyDown();
          return MouseAction.MouseDown;
        } else {
          return MouseAction.None;
        }

      case MouseAction.MouseDown:
        if (Input.IsMouseDown(Input.BUTTON_LEFT)) {
          onKeyDown();
          return MouseAction.MouseDown;
        } else {
          onKeyUp();
          return MouseAction.MouseUp;
        }

      case MouseAction.MouseUp:
        onKeyUp();
        onClick();
        return MouseAction.MouseClick;

      case MouseAction.MouseClick:
        return MouseAction.None;

      default:
        return MouseAction.None;
    }
  }

  private StepMouseDragDropState() {
    switch (this.mouseDragDropState) {
      case MouseDragDrop.None:
        if (this.mouseActionState !== MouseAction.MouseDown) {
          return MouseDragDrop.None;
        } else if (this.mouseMovementState !== MouseMovement.MouseHover) {
          return MouseDragDrop.None;
        } else if (DragDropState.IsDragging) {
          return MouseDragDrop.DragEnter;
        } else {
          return MouseDragDrop.DragFocus;
        }

      case MouseDragDrop.DragFocus:
        return MouseDragDrop.DragPending;

      case MouseDragDrop.DragPending:
        if (!Input.IsMouseDown(Input.BUTTON_LEFT)) {
          return MouseDragDrop.None;
        } else if (DragDropState.IsStartDragging(Input.GetMousePosition())) {
          return MouseDragDrop.DragStart;
        } else {
          return MouseDragDrop.DragPending;
        }

      case MouseDragDrop.DragStart:
        if (Input.IsMouseDown(Input.BUTTON_LEFT)) {
          return MouseDragDrop.DragMove;
        } else {
          return MouseDragDrop.DragEnd;
        }

      case MouseDragDrop.DragEnd:
        return MouseDragDrop.None;

      case MouseDragDrop.DragEnter:
        if (!this.HitTest(this._intrinsicWidth, this._intrinsicHeight)) {
          return MouseDragDrop.DragLeave;
        } else if (!Input.IsMouseDown(Input.BUTTON_LEFT)) {
          return MouseDragDrop.Drop;
        } else {
          return MouseDragDrop.DragMove;
        }

      case MouseDragDrop.DragLeave:
        return MouseDragDrop.None;

      case MouseDragDrop.DragMove:
        if (this.isDragging) {
          if (Input.IsMouseDown(Input.BUTTON_LEFT)) {
            return MouseDragDrop.DragMove;
          } else {
            return MouseDragDrop.DragEnd;
          }
        } else {
          if (!this.HitTest(this._intrinsicWidth, this._intrinsicHeight)) {
            return MouseDragDrop.DragLeave;
          } else if (!Input.IsMouseDown(Input.BUTTON_LEFT)) {
            return MouseDragDrop.Drop;
          } else {
            return MouseDragDrop.DragMove;
          }
        }

      case MouseDragDrop.Drop:
        return MouseDragDrop.None;

      default:
        return MouseDragDrop.None;
    }
  }

  private StepMouseMovementState() {
    const {
      onHover = Blackhole,
      onEnter = Blackhole,
      onLeave = Blackhole,
    } = this.options;

    const isMouseWithin = this.HitTest(
      this._intrinsicWidth,
      this._intrinsicHeight
    );

    switch (this.mouseMovementState) {
      case MouseMovement.None:
        if (isMouseWithin) {
          onEnter();
          onHover(true);
          return MouseMovement.MouseEnter;
        } else {
          return MouseMovement.None;
        }

      case MouseMovement.MouseEnter:
        if (!isMouseWithin) {
          onLeave();
          onHover(false);
          return MouseMovement.MouseLeave;
        } else {
          return MouseMovement.MouseHover;
        }

      case MouseMovement.MouseHover:
        if (!isMouseWithin) {
          onLeave();
          onHover(false);
          return MouseMovement.MouseLeave;
        } else {
          return MouseMovement.MouseHover;
        }

      case MouseMovement.MouseLeave:
        if (isMouseWithin) {
          onEnter();
          onHover(true);
          return MouseMovement.MouseEnter;
        } else {
          return MouseMovement.None;
        }

      default:
        return MouseMovement.None;
    }
  }
}

import { Input } from "../../buildin/media/input";
import { Blackhole } from "../../util/common";
import { ReadonlyVector2, Vector2 } from "../../util/vector2";
import { Entity } from "../entity";
import { Node } from "../node";
import { PipeLineTask } from "../pipeline";
import { PipelineTaskPriority } from "../task/consts";

const DRAG_START_THRESHOLD = 3;

const GlobalDragDropState = new (class DragDropState {
  private data: any = null;
  private dragStartPosition: ReadonlyVector2 = new Vector2();
  private source: Entity | null = null;

  public get isDragging(): boolean {
    return this.source != null;
  }

  public get isDragStart(): boolean {
    return this.dragDistance >= DRAG_START_THRESHOLD;
  }

  public get dragDistance(): number {
    return this.dragOffset.Length;
  }

  public get dragOffset(): Vector2 {
    const currentPosition = Input.GetMousePosition();
    return currentPosition.Subtract(this.dragStartPosition);
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

export type DragDropState = typeof GlobalDragDropState;

interface EntityInputEventMap {
  MouseKeyDown: 0;
  MouseKeyUp: 0;
  MouseClick: 0;
  MouseEnter: 0;
  MouseLeave: 0;
  DragStart: 0;
  DragMove: 0;
  DragEnd: 0;
  DragEnter: 0;
  DragOver: 0;
  DragLeave: 0;
  Drop: 0;
}

const enum MouseAction {
  None,
  MouseDown,
  MouseUp,
  MouseClick,
}

const enum MouseDragDrop {
  None,
  DragPending,
  DragStart,
  DragEnd,
  DragMove,
  DragEnter,
  DragLeave,
  DragOver,
  Drop,
}

const enum MouseMovement {
  None,
  MouseEnter,
  MouseLeave,
  MouseHover,
}

export class MouseState {
  public readonly host: Entity;

  public version: number = 0;

  private mouseActionState: MouseAction = MouseAction.None;
  private mouseDragDropState: MouseDragDrop = MouseDragDrop.None;
  private mouseMovementState: MouseMovement = MouseMovement.None;

  public constructor(host: Entity) {
    this.host = host;
  }

  public Step(
    isMouseWithin: boolean,
    isMouseButtonDown: boolean,
    onEmitEvent: (type: keyof EntityInputEventMap) => void
  ): void {
    this.mouseMovementState = this.StepMouseMovementState(
      isMouseWithin,
      onEmitEvent
    );
    this.mouseActionState = this.StepMouseActionState(
      isMouseWithin,
      isMouseButtonDown,
      onEmitEvent
    );
    this.mouseDragDropState = this.StepMouseDragDropState(
      isMouseWithin,
      isMouseButtonDown,
      onEmitEvent
    );

    this.version++;
  }

  private StepMouseActionState(
    isMouseWithin: boolean,
    isMouseButtonDown: boolean,
    emitEvent: (type: keyof EntityInputEventMap) => void
  ): MouseAction {
    if (!isMouseWithin) {
      return MouseAction.None;
    }

    switch (this.mouseActionState) {
      case MouseAction.None: {
        if (isMouseButtonDown) {
          emitEvent("MouseKeyDown");
          return MouseAction.MouseDown;
        }

        return MouseAction.None;
      }

      case MouseAction.MouseDown: {
        if (isMouseButtonDown) {
          emitEvent("MouseKeyDown");
          return MouseAction.MouseDown;
        }

        emitEvent("MouseKeyUp");
        return MouseAction.MouseUp;
      }

      case MouseAction.MouseUp:
        emitEvent("MouseClick");
        return MouseAction.MouseClick;

      case MouseAction.MouseClick:
        return MouseAction.None;

      default:
        return MouseAction.None;
    }
  }

  private StepMouseDragDropState(
    isMouseWithin: boolean,
    isMouseButtonDown: boolean,
    emitEvent: (type: keyof EntityInputEventMap) => void
  ): MouseDragDrop {
    const { draggable, droppable } = this.host;

    switch (this.mouseDragDropState) {
      case MouseDragDrop.None: {
        if (!isMouseWithin || !isMouseButtonDown) {
          return MouseDragDrop.None;
        }

        if (GlobalDragDropState.isDragging) {
          if (droppable) {
            emitEvent("DragEnter");
            return MouseDragDrop.DragEnter;
          }

          return MouseDragDrop.None;
        }

        if (draggable) {
          GlobalDragDropState.SetDragStartPoint();
          return MouseDragDrop.DragPending;
        }

        return MouseDragDrop.None;
      }

      case MouseDragDrop.DragPending: {
        if (!isMouseWithin || !isMouseButtonDown) {
          return MouseDragDrop.None;
        }

        if (GlobalDragDropState.isDragStart) {
          GlobalDragDropState.SetSource(this.host);
          emitEvent("DragStart");
          return MouseDragDrop.DragStart;
        }

        return MouseDragDrop.DragPending;
      }

      case MouseDragDrop.DragStart:
      case MouseDragDrop.DragMove: {
        if (isMouseButtonDown) {
          emitEvent("DragMove");
          return MouseDragDrop.DragMove;
        }

        emitEvent("DragEnd");
        return MouseDragDrop.DragEnd;
      }

      case MouseDragDrop.DragEnd:
        GlobalDragDropState.ClearSource();
        return MouseDragDrop.None;

      case MouseDragDrop.DragEnter:
      case MouseDragDrop.DragOver: {
        if (!isMouseButtonDown) {
          emitEvent("Drop");
          return MouseDragDrop.Drop;
        }

        if (!isMouseWithin) {
          emitEvent("DragLeave");
          return MouseDragDrop.DragLeave;
        }

        emitEvent("DragOver");
        return MouseDragDrop.DragOver;
      }

      case MouseDragDrop.DragLeave:
        return MouseDragDrop.None;

      case MouseDragDrop.Drop:
        GlobalDragDropState.ClearData();
        return MouseDragDrop.None;

      default:
        return MouseDragDrop.None;
    }
  }

  private StepMouseMovementState(
    isMouseWithin: boolean,
    emitEvent: (type: keyof EntityInputEventMap) => void
  ): MouseMovement {
    switch (this.mouseMovementState) {
      case MouseMovement.None: {
        if (isMouseWithin) {
          emitEvent("MouseEnter");
          return MouseMovement.MouseEnter;
        }

        return MouseMovement.None;
      }

      case MouseMovement.MouseEnter: {
        if (!isMouseWithin) {
          emitEvent("MouseLeave");
          return MouseMovement.MouseLeave;
        }

        return MouseMovement.MouseHover;
      }

      case MouseMovement.MouseHover: {
        if (!isMouseWithin) {
          emitEvent("MouseLeave");
          return MouseMovement.MouseLeave;
        }

        return MouseMovement.MouseHover;
      }

      case MouseMovement.MouseLeave: {
        if (isMouseWithin) {
          emitEvent("MouseEnter");
          return MouseMovement.MouseEnter;
        }

        return MouseMovement.None;
      }

      default:
        return MouseMovement.None;
    }
  }
}

export class EntityInputEvent {
  public constructor(
    public readonly source: Entity,
    public readonly type: keyof EntityInputEventMap,
    public readonly dragDropState: DragDropState
  ) {}
}

interface EntityInputEventListener {
  target: Entity;
  version: number;
}

export const InputManager = new (class InputManager {
  public readonly listeners: EntityInputEventListener[] = [];

  public PickListener = (node: Node): void => {
    if (node instanceof Entity && node.enableInputEvents) {
      this.listeners.push({
        target: node,
        version: node._mouseState.version,
      });
    }
  };

  public DispatchEvents(): void {
    const queue = this.listeners;

    // 记录是否有元素通过了HitTest
    let hasPassedHitTest = false;

    // 由于队列中的元素顺序跟随绘图顺序，但HitTest需要从元素叠放次序自顶向下检查，
    // 因此以逆序遍历数组
    let count = queue.length;
    while (count-- > 0) {
      const { target, version } = queue[count];

      // 在事件分发过程中，如果队列中的某个元素是之前另一个已经派发过事件的元素的祖先，
      // 并且该元素的version比进入队列时的version快照要大，那么说明
      // 该元素之前已经被冒泡派发过一次事件了，不应该再重复步进事件状态机，因此直接跳过。
      if (version < target._mouseState.version) {
        continue;
      }

      // 如果有元素通过HitTest，则队列中后续元素的鼠标悬浮和点击判定结果一律视作false。
      // 该机制主要用以防止鼠标操作穿透。
      let isKeyDown = false;
      let isHit = false;
      if (!hasPassedHitTest) {
        isKeyDown = Input.IsMouseDown(Input.BUTTON_LEFT);
        isHit = target.HitTest();
        if (isHit) {
          hasPassedHitTest = true;
        }
      }

      target._mouseState.Step(
        isHit,
        isKeyDown,

        // 状态机更新途中可能会多次触发事件
        (type: keyof EntityInputEventMap) => {
          let canPropagate: boolean = true;

          const event = new EntityInputEvent(target, type, GlobalDragDropState);
          canPropagate = (target._Input(event) ?? true) && canPropagate;

          // 对事件进行冒泡
          target.Bubble((ancestor) => {
            if (!(ancestor instanceof Entity) || !ancestor.enableInputEvents) {
              return;
            }

            // 由于父节点的事件由子节点冒泡而来，因此自身状态机不再生成新的事件
            ancestor._mouseState.Step(ancestor.HitTest(), isKeyDown, Blackhole);

            if (canPropagate) {
              canPropagate = (ancestor._Input(event) ?? true) && canPropagate;
            }
          });
        }
      );
    }
  }

  public Reset(): void {
    this.listeners.length = 0;
  }
})();

export class TaskInput implements PipeLineTask {
  public readonly priority: number = PipelineTaskPriority.Input;

  public Run(): void {
    InputManager.DispatchEvents();
    InputManager.Reset();
  }
}

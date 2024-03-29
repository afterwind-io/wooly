import { Blackhole } from "../../util/common";
import { ReadonlyVector2, Vector2 } from "../../util/vector2";
import { CanvasItem } from "../canvasItem";
import { Entity } from "../entity";
import { LogicalScreenOffsetMap } from "../globals";
import { Node } from "../node";
import { PipeLineTask } from "../pipeline";
import { PipelineTaskPriority } from "../task/consts";

const DRAG_START_THRESHOLD = 3;

export const GlobalDragDropState = new (class DragDropState {
  private data: any = null;
  private dragStartPosition: ReadonlyVector2 = new Vector2();
  private dragPenuPosition: ReadonlyVector2 = new Vector2();
  private dragPrevPosition: ReadonlyVector2 = new Vector2();
  private source: Entity | null = null;

  public get isDragging(): boolean {
    return this.source != null;
  }

  public get dragDelta(): Vector2 {
    return this.dragPrevPosition.Subtract(this.dragPenuPosition);
  }

  public isDragStart(hostScope: number): boolean {
    return this.getDragOffset(hostScope).Length >= DRAG_START_THRESHOLD;
  }

  public getDragOffset(hostScope: number): Vector2 {
    const mousePosition = Input.GetMousePosition(hostScope);
    return mousePosition.Subtract(this.dragStartPosition);
  }

  public ClearData(): void {
    this.data = null;
  }

  public ClearSource(): void {
    this.source = null;
    this.dragStartPosition = Vector2.Zero;
    this.dragPenuPosition = Vector2.Zero;
    this.dragPrevPosition = Vector2.Zero;
  }

  public GetData(): any {
    return this.data;
  }

  public GetSource(): Entity | null {
    return this.source;
  }

  public SetData(data: any = null): void {
    this.data = data;
  }

  public SetSource(source: Entity): void {
    this.source = source;
  }

  public SetDragStartPoint(hostScope: number): void {
    const mousePosition = Input.GetMousePosition(hostScope);
    this.dragStartPosition = mousePosition;
    this.dragPenuPosition = mousePosition;
    this.dragPrevPosition = mousePosition;
  }

  public UpdateDragPosition(hostScope: number): void {
    const mousePosition = Input.GetMousePosition(hostScope);
    this.dragPenuPosition = this.dragPrevPosition;
    this.dragPrevPosition = mousePosition;
  }
})();

export type DragDropState = typeof GlobalDragDropState;

interface EntityInputEventMap {
  MouseKeyDown: 0;
  MouseKeyUp: 0;
  MouseClick: 0;
  MouseEnter: 0;
  MouseLeave: 0;
  MouseMove: 0;
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
  MouseMove,
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
          GlobalDragDropState.SetDragStartPoint(this.host.scope);
          return MouseDragDrop.DragPending;
        }

        return MouseDragDrop.None;
      }

      case MouseDragDrop.DragPending: {
        if (!isMouseButtonDown) {
          return MouseDragDrop.None;
        }

        if (GlobalDragDropState.isDragStart(this.host.scope)) {
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
          GlobalDragDropState.UpdateDragPosition(this.host.scope);
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

        if (Input.IsMouseMoved(this.host.scope)) {
          emitEvent("MouseMove");
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

interface InputMousePositionLog {
  previous: Vector2;
  current: Vector2;
}

export const Input = new (class Input {
  public readonly BUTTON_LEFT: number = 0;
  public readonly BUTTON_MIDDLE: number = 1;
  public readonly BUTTON_RIGHT: number = 2;

  private mouseButtonMap: Record<number, boolean> = {};

  private nativeMousePosition: Vector2 = Vector2.Zero;
  private mousePositionLogsByScope: Map<number, InputMousePositionLog> =
    new Map();

  private keyDownMap: Record<string, boolean> = {};
  private keyPressMap: Record<string, boolean> = {};
  private prevKey: string = "";

  // FIXME 这个选项不应该放在这里设置
  private isEnableContentMenu: boolean = false;

  public Attach(target: HTMLElement) {
    document.addEventListener("keydown", this.OnKeyDown);
    document.addEventListener("keyup", this.OnKeyUp);

    // FIXME 移除这个事件钩子
    target.addEventListener("contextmenu", this.OnContextMenu);

    target.addEventListener("mousedown", this.OnMouseDown, { passive: true });
    target.addEventListener("mousemove", this.OnMouseMove, { passive: true });
    target.addEventListener("mouseup", this.OnMouseUp, { passive: true });
  }

  public EnableContextMenu(f: boolean) {
    this.isEnableContentMenu = f;
  }

  public GetMouseDelta(hostScope: number): Vector2 {
    const log = this.mousePositionLogsByScope.get(hostScope);
    if (!log) {
      return Vector2.Zero;
    }

    return log.current.Subtract(log.previous);
  }

  public GetMousePosition(scope: number = 0): ReadonlyVector2 {
    const logicalScreenOffset = LogicalScreenOffsetMap[scope] || Vector2.Zero;

    let scopedMousePosInfo = this.mousePositionLogsByScope.get(scope);
    if (!scopedMousePosInfo) {
      this.mousePositionLogsByScope.set(
        scope,
        (scopedMousePosInfo = {
          previous: Vector2.Zero,
          current: this.nativeMousePosition.Subtract(logicalScreenOffset),
        })
      );
    }

    return scopedMousePosInfo.current;
  }

  public IsKeyDown(key: string): boolean {
    return !!this.keyDownMap[key];
  }

  public IsKeyPress(key: string): boolean {
    const f = !!this.keyPressMap[key];
    /**
     * 如果按键查询发生频率很高(Entity的Update中)，
     * 会发生OnKeyUp来不及重置keyPressMap的情况。
     * 因此在keypress为true的情况下，直接在查询中
     * 将值置为false，以防止下次查询出现伪真值的问题
     */
    if (f) {
      this.keyPressMap[key] = false;
    }
    return f;
  }

  public IsMouseDown(btn: number): boolean {
    return !!this.mouseButtonMap[btn];
  }

  public IsMouseMoved(hostScope: number): boolean {
    const log = this.mousePositionLogsByScope.get(hostScope);
    if (!log) {
      return false;
    }

    return log.current.Equals(log.previous);
  }

  public UpdateMousePositionLog(): void {
    // 刷新每一帧的鼠标位置记录
    const nativePos = this.nativeMousePosition;

    for (const [scope, log] of this.mousePositionLogsByScope) {
      const logicalScreenOffset = LogicalScreenOffsetMap[scope] || Vector2.Zero;

      const positionByScope = nativePos.Subtract(logicalScreenOffset);
      const hasMoved = !Vector2.Equals(log.current, positionByScope);
      if (hasMoved) {
        log.current = positionByScope;
      }
      log.previous = log.current;
    }
  }

  private OnContextMenu = (e: MouseEvent) => {
    if (this.isEnableContentMenu) {
      return;
    }

    e.preventDefault();
  };

  private OnKeyDown = (e: KeyboardEvent) => {
    const key = e.key;

    this.keyDownMap[key] = true;
    this.keyPressMap[key] = true;
    this.keyPressMap[this.prevKey] = false;

    this.prevKey = key;
  };

  private OnKeyUp = (e: KeyboardEvent) => {
    this.keyDownMap[e.key] = false;
    this.keyPressMap[e.key] = false;

    this.prevKey = "";
  };

  private OnMouseDown = (e: MouseEvent) => {
    this.mouseButtonMap[e.button] = true;
  };

  private OnMouseMove = (e: MouseEvent) => {
    this.nativeMousePosition.x = e.offsetX;
    this.nativeMousePosition.y = e.offsetY;
  };

  private OnMouseUp = (e: MouseEvent) => {
    this.mouseButtonMap[e.button] = false;
  };
})();

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
  /**
   * 所有`_Input`事件监听元素的临时缓存
   */
  private readonly listeners: EntityInputEventListener[] = [];

  public PickListener = (node: CanvasItem): void => {
    if (node instanceof Entity && node.enableInputEvents) {
      this.listeners.push({
        target: node,
        version: node._mouseState.version,
      });
    }
  };

  public DispatchEvents(): void {
    // 分发队列
    const queue = this.listeners;

    // 记录通过了HitTest的元素
    let hitTargets: Entity[] = [];
    // 记录当前是否处在允许鼠标事件穿透的状态
    let escaping: boolean = true;

    // 记录鼠标左键是否按下
    const isMouseButtonDown: boolean = Input.IsMouseDown(Input.BUTTON_LEFT);

    // 由于分发队列中的元素顺序跟随绘图顺序，但HitTest需要根据元素叠放次序自顶向下检查，
    // 因此以逆序遍历数组
    let i = queue.length;
    while (i-- > 0) {
      const { target, version } = queue[i];

      const mousePosition = Input.GetMousePosition(target.scope);

      // 在事件分发过程中，如果队列中的某个元素是之前另一个已经派发过事件的元素的祖先，
      // 并且该元素当前的version比进入队列时的version快照要大，那么说明
      // 该元素之前已经被冒泡派发过一次事件了，不应该再重复步进事件状态机，因此直接跳过。
      if (version < target._mouseState.version) {
        continue;
      }

      // 如果当前处于拖放操作中，那么除了被拖动的元素外，
      // 其它元素均不应再进行HitTest，鼠标悬浮和点击判定结果一律视作false。
      // 该机制主要为了防止被拖动元素的状态被某个其它接收点击事件的元素意外打断。
      if (
        GlobalDragDropState.isDragging &&
        target !== GlobalDragDropState.GetSource()
      ) {
        Dispatch(target, false, false);
        continue;
      }

      // 如果有元素通过HitTest，并且处在不允许鼠标事件穿透的状态，
      // 则分发队列中后续元素的鼠标悬浮和点击判定结果一律视作false。
      if (hitTargets.length !== 0 && !escaping) {
        Dispatch(target, false, false);
        continue;
      }

      const isHit = target.HitTest(mousePosition);
      if (isHit) {
        hitTargets.push(target);
        escaping = escaping && target.enableInputEventsEscaping;

        // HitTest通过的元素会被递延执行事件派发（原因见下方注释）
        // 如果该元素的祖先节点也监听了_Input，那么它一定会出现在分发队列的后续元素中。
        // 因此为了避免祖先节点被后续队列遍历派发了错误的事件，此处先向上冒泡一次，
        // 更新祖先节点的状态version，从而利用上方的版本比对机制跳过派发操作。
        target.Bubble((ancestor) => {
          if (IsDispatchTarget(ancestor)) {
            ancestor._mouseState.version++;
          }
        }, false);

        continue;
      }

      // 为未通过HitTest的元素正常分发事件
      Dispatch(target, false, isMouseButtonDown);
    }

    // 递延分发先前通过HitTest的元素的事件。
    // 该机制保证了通过HitTest元素触发事件的执行结果，不会被未通过元素的事件操作所覆盖。
    //
    // 比如，有两个元素A、B均分别监听了"MouseEnter"和"MouseLeave"两个事件，
    // 并且都在事件回调中操作了某个相同的变量。如果在分发队列中，A的顺序在B之前，
    // 那么就会发生A的"MouseEnter"结果被B的"MouseLeave"覆写。这种错误常发生于
    // 切换鼠标光标等场合。
    for (const hitTarget of hitTargets) {
      Dispatch(hitTarget, true, isMouseButtonDown);
    }
  }

  public Reset(): void {
    this.listeners.length = 0;
  }
})();

function IsDispatchTarget(node: Node): node is Entity {
  return node instanceof Entity && node.enableInputEvents;
}

function Dispatch(
  target: Entity,
  isHit: boolean,
  isMouseButtonDown: boolean
): void {
  target._mouseState.Step(
    isHit,
    isMouseButtonDown,

    // 状态机更新途中可能会多次触发事件
    (type: keyof EntityInputEventMap) => {
      const event = new EntityInputEvent(target, type, GlobalDragDropState);

      let canPropagate = target._Input(event) ?? true;
      if (!isHit && !isMouseButtonDown) {
        return;
      }

      // 对事件进行冒泡
      target.Bubble((ancestor) => {
        if (!IsDispatchTarget(ancestor)) {
          return;
        }

        ancestor._mouseState.Step(
          isHit,
          isMouseButtonDown,
          // 由于祖先节点的事件由子节点冒泡而来，因此自身状态机不再生成新的事件
          Blackhole
        );

        if (canPropagate) {
          canPropagate = (ancestor._Input(event) ?? true) && canPropagate;
        }
      });
    }
  );
}

export class TaskInput implements PipeLineTask {
  public readonly priority: number = PipelineTaskPriority.Input;

  public Run(): void {
    Input.UpdateMousePositionLog();

    InputManager.DispatchEvents();
    InputManager.Reset();
  }
}

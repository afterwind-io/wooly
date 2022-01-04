import { Entity, EntitySignals } from "../../../core/entity";
import { OneTimeCachedGetter } from "../../../util/cachedGetter";
import { Vector2 } from "../../../util/vector2";
import { Input } from "../../media/input";
import { Constraint } from "../common/constraint";
import { Length, Size } from "../common/types";
import { WidgetRoot } from "../root";
import {
  CommonWidgetOptions,
  MouseAction,
  MouseDragDrop,
  MouseMovement,
  MultiChildWidgetOptions,
} from "./types";

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

export type WidgetOptions = CommonWidgetOptions & MultiChildWidgetOptions;

/**
 * [**Decorator**]
 *
 * @example
 * ```ts
 * class MyWidget extends Widget {
 *   @UIAction
 *   public DoSomething {
 *     this.a = 1;
 *     // this.ForceUpdate()
 *   }
 * }
 * ```
 */
export function UIAction(
  target: Widget & Record<string, any>,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = target[propertyKey] as Function;
  descriptor.value = function (this: Widget, ...args: any[]) {
    originalMethod.apply(this, args);
    this.Refresh();
  };
}

export function CreateContext() {
  // TODO 生成context组件，如何引用？如何刷新引用组件？
}

interface WidgetFiber {
  type: any;
  options: Record<string, any>;
  children: WidgetFiber[];
  instance: Widget;
}

export abstract class Widget<
  OPT = {},
  SIG extends EntitySignals = EntitySignals
> extends Entity<SIG> {
  public abstract readonly name: string;

  public _intrinsicWidth: number = 0;
  public _intrinsicHeight: number = 0;

  public readonly tag: string;
  public width: Length;
  public height: Length;

  protected draggable: boolean = false;
  protected mouseActionState: MouseAction = MouseAction.None;
  protected mouseDragDropState: MouseDragDrop = MouseDragDrop.None;
  protected mouseMovementState: MouseMovement = MouseMovement.None;

  protected childWidgets: Widget[];
  protected options: OPT;
  protected _fiber: WidgetFiber;

  public constructor(options: WidgetOptions = {}) {
    super();

    this.options = options as unknown as OPT;

    this.tag = options.tag || "";
    this.width = options.width || "shrink";
    this.height = options.height || "shrink";
    this.childWidgets = options.children || [];

    this._fiber = {
      type: this.constructor,
      options,
      children: [],
      instance: this,
    };
  }

  public get isDragging(): boolean {
    return DragDropState.source === this;
  }

  @OneTimeCachedGetter({ emptyValue: null })
  protected get root(): WidgetRoot {
    const parent = this.parent as WidgetRoot | Widget | null;
    if (parent instanceof WidgetRoot) {
      return parent;
    } else if (parent) {
      return parent.root;
    }

    throw new Error("[wooly] Widget should be the child of WidgetRoot.");
  }

  public $Layout(constraint: Constraint): Size {
    return this._Layout(constraint);
  }

  public _Update(delta: number) {
    const nextMovementState = this.StepMouseMovementState();
    this.mouseMovementState = nextMovementState;

    const nextActionState = this.StepMouseActionState();
    this.mouseActionState = nextActionState;

    if (this.draggable) {
      // NOTE 应始终在移动和点击状态更新后执行
      this.HandleDragDrop();
    }
  }

  public _Input(e: InputEvent) {}

  protected abstract _Layout(constraint: Constraint): Size;

  protected abstract _Render(): Widget | Widget[] | null;

  public Refresh(): void {
    // TODO 如果一个子节点的size发生变化，需要向上传播重新layout
    this.root.OnWidgetUpdate(this);
  }

  public ScheduleUpdate(): void {
    const widgets = this._Render();

    let childFibers: WidgetFiber[];
    if (Array.isArray(widgets)) {
      childFibers = widgets.map((w) => w._fiber);
    } else if (widgets) {
      childFibers = [widgets._fiber];
    } else {
      childFibers = [];
    }

    const prevFiber = this._fiber;
    let prevChildFibers: WidgetFiber[];
    if (prevFiber) {
      prevChildFibers = prevFiber.children;
    } else {
      prevChildFibers = [];
    }

    this.ReconcileChildren(this, prevChildFibers, childFibers);

    this._fiber = {
      type: this.constructor,
      options: this._fiber.options,
      children: childFibers,
      instance: this,
    };
  }

  protected GetFirstChild(): Widget | null {
    const child = this.children[0];
    if (!child) {
      return null;
    }

    if (!(child instanceof Widget)) {
      throw new Error(
        '[wooly] The child of the "Widget" must be an instance of "Widget".'
      );
    }

    return child as Widget;
  }

  private Reconcile(
    oldFiber: WidgetFiber | null,
    newFiber: WidgetFiber | null
  ): void {
    if (!oldFiber && newFiber) {
      this.AddChild(newFiber.instance);
      // this.ReconcileChildren(newFiber.instance, [], newFiber.children);
      newFiber.instance.ScheduleUpdate();
      return;
    }

    if (!oldFiber && !newFiber) {
      return;
    }

    if (oldFiber && !newFiber) {
      oldFiber.instance.Free();
      return;
    }

    // if (oldFiber!.type !== newFiber!.type) {
    oldFiber!.instance.Free();
    this.AddChild(newFiber!.instance);
    // this.ReconcileChildren(
    //   newFiber!.instance,
    //   oldFiber!.children,
    //   newFiber!.children
    // );
    newFiber!.instance.ScheduleUpdate();
    return;
    // }

    // this.ReconcileChildren(this, oldFiber!.children, newFiber!.children);
  }

  private ReconcileChildren(
    root: Widget,
    oldChildren: WidgetFiber[],
    newChildren: WidgetFiber[]
  ): void {
    const maxCount = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < maxCount; i++) {
      const oldChildWidget = oldChildren[i];
      const newChildWidget = newChildren[i];
      root.Reconcile(oldChildWidget, newChildWidget);
    }
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
    if (this.mouseMovementState === MouseMovement.None) {
      return MouseAction.None;
    }

    switch (this.mouseActionState) {
      case MouseAction.None:
        if (Input.IsMouseDown(Input.BUTTON_LEFT)) {
          return MouseAction.MouseDown;
        } else {
          return MouseAction.None;
        }

      case MouseAction.MouseDown:
        if (Input.IsMouseDown(Input.BUTTON_LEFT)) {
          return MouseAction.MouseDown;
        } else {
          return MouseAction.MouseUp;
        }

      case MouseAction.MouseUp:
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
        if (!this.IsMouseWithin(this._intrinsicWidth, this._intrinsicHeight)) {
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
          if (
            !this.IsMouseWithin(this._intrinsicWidth, this._intrinsicHeight)
          ) {
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
    const isMouseWithin = this.IsMouseWithin(
      this._intrinsicWidth,
      this._intrinsicHeight
    );

    switch (this.mouseMovementState) {
      case MouseMovement.None:
        if (isMouseWithin) {
          return MouseMovement.MouseEnter;
        } else {
          return MouseMovement.None;
        }

      case MouseMovement.MouseEnter:
        if (!isMouseWithin) {
          return MouseMovement.MouseLeave;
        } else {
          return MouseMovement.MouseHover;
        }

      case MouseMovement.MouseHover:
        if (!isMouseWithin) {
          return MouseMovement.MouseLeave;
        } else {
          return MouseMovement.MouseHover;
        }

      case MouseMovement.MouseLeave:
        if (isMouseWithin) {
          return MouseMovement.MouseEnter;
        } else {
          return MouseMovement.None;
        }

      default:
        return MouseMovement.None;
    }
  }
}

import { Entity, EntitySignals } from "../../../core/entity";
import { OneTimeCachedGetter } from "../../../util/cachedGetter";
import { Constraint } from "../common/constraint";
import { Length, Size } from "../common/types";
import { WidgetRoot } from "../root";
import {
  CommonWidgetOptions,
  MultiChildWidgetOptions,
  SingleChildWidgetOptions,
} from "./types";

export type WidgetOptions = CommonWidgetOptions &
  SingleChildWidgetOptions &
  MultiChildWidgetOptions;

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

  protected childWidgets: Widget[];
  protected options: OPT;
  protected _fiber: WidgetFiber;

  public constructor(options: WidgetOptions = {}) {
    super();

    this.options = options as unknown as OPT;

    this.tag = options.tag || "";
    this.width = options.width || "shrink";
    this.height = options.height || "shrink";

    this.childWidgets = options.child
      ? [options.child]
      : options.children || [];

    this._fiber = {
      type: this.constructor,
      options,
      children: [],
      instance: this,
    };
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

  protected GetFirstChildWidget(): Widget | null {
    return this.childWidgets[0] || null;
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
}

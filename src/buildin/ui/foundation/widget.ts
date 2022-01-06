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
  public _isLayoutDirty: boolean = false;
  public _prevConstraint: Constraint = new Constraint();

  public tag!: string;
  public width!: Length;
  public height!: Length;

  protected childWidgets!: Widget[];
  protected options!: OPT;
  protected _fiber: WidgetFiber;

  public constructor(options: WidgetOptions = {}) {
    super();

    this.InitLocalState(options);

    this._fiber = {
      type: this.constructor,
      options,
      children: [],
      instance: this,
    };
  }

  @OneTimeCachedGetter({ emptyValue: null })
  protected get root(): WidgetRoot {
    let root = null;
    this.Bubble((node) => {
      if (node instanceof WidgetRoot) {
        root = node;
        return true;
      }
    });

    if (root) {
      return root;
    }

    throw new Error("[wooly] Widget should be the child of WidgetRoot.");
  }

  public $Layout(constraint: Constraint): Size {
    this._isLayoutDirty = false;
    this._prevConstraint = constraint;

    return this._Layout(constraint);
  }

  public _Input(e: InputEvent) {}

  protected abstract _Layout(constraint: Constraint): Size;

  protected abstract _Render(): Widget | Widget[] | null;

  public FindNearestParent(
    predicate: (widget: Widget) => boolean | undefined
  ): Widget | null {
    let parent: Widget | null = null;

    this.Bubble((node) => {
      if (!(node instanceof Widget)) {
        return;
      }

      if (predicate(node)) {
        parent = node;
        return true;
      }
    });

    return parent;
  }

  public Refresh(): void {
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

    this._fiber = {
      type: this.constructor,
      options: this.options,
      children: this.ReconcileChildren(this, prevChildFibers, childFibers),
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

  private InitLocalState(options: WidgetOptions): void {
    this.options = options as unknown as OPT;

    this.tag = options.tag || "";
    this.width = options.width || "shrink";
    this.height = options.height || "shrink";

    this.childWidgets = options.child
      ? [options.child]
      : options.children || [];
  }

  private Reconcile(
    oldFiber: WidgetFiber | null,
    newFiber: WidgetFiber | null
  ): WidgetFiber | null {
    if (!oldFiber && newFiber) {
      this.AddChild(newFiber.instance);
      newFiber.instance.ScheduleUpdate();
      return newFiber;
    }

    if (!oldFiber && !newFiber) {
      return null;
    }

    if (oldFiber && !newFiber) {
      oldFiber.instance.Free();
      return null;
    }

    if (oldFiber!.type !== newFiber!.type) {
      this.AddChild(newFiber!.instance);
      newFiber!.instance.ScheduleUpdate();

      oldFiber!.instance.Free();
      return newFiber;
    }

    // FIXME 需要key来处理强制刷新的情况
    // TODO 实现memo机制？

    oldFiber!.options = newFiber!.options;
    oldFiber!.instance.InitLocalState(newFiber!.options);
    oldFiber!.instance.ScheduleUpdate();
    return oldFiber;
  }

  private ReconcileChildren(
    root: Widget,
    oldChildren: WidgetFiber[],
    newChildren: WidgetFiber[]
  ): WidgetFiber[] {
    const maxCount = Math.max(oldChildren.length, newChildren.length);

    const children: (WidgetFiber | null)[] = [];
    for (let i = 0; i < maxCount; i++) {
      const oldChildWidget = oldChildren[i];
      const newChildWidget = newChildren[i];

      const fiber = root.Reconcile(oldChildWidget, newChildWidget);
      if (fiber) {
        children.push(fiber);
      }
    }

    return children as WidgetFiber[];
  }
}

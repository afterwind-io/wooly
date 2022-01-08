import { Entity, EntitySignals } from "../../../core/entity";
import { OneTimeCachedGetter } from "../../../util/cachedGetter";
import { Nullable } from "../../../util/common";
import { Constraint } from "../common/constraint";
import { Size } from "../common/types";
import { WidgetRoot } from "../root";
import { CommonWidgetOptions } from "./types";

export function CreateContext() {
  // TODO 生成context组件，如何引用？如何刷新引用组件？
}

interface WidgetFiber {
  type: any;
  options: Record<string, any>;
  children: Nullable<WidgetFiber>[];
  instance: Widget;
}

export abstract class Widget<
  OPT extends CommonWidgetOptions = {},
  SIG extends EntitySignals = EntitySignals
> extends Entity<SIG> {
  public abstract readonly name: string;

  public _intrinsicWidth: number = 0;
  public _intrinsicHeight: number = 0;
  public _isLayoutDirty: boolean = false;
  public _prevConstraint: Constraint = new Constraint();

  public options: OPT;

  private _fiber: WidgetFiber;

  public constructor(options: OPT) {
    super();

    this.options = this.NormalizeOptions(options);

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

  public $Render(): void {
    const widgets = this._Render();

    let childFibers: Nullable<WidgetFiber>[];
    if (Array.isArray(widgets)) {
      childFibers = widgets.map((w) => (w ? w._fiber : null));
    } else if (widgets) {
      childFibers = [widgets._fiber];
    } else {
      childFibers = [];
    }

    const prevFiber = this._fiber;
    let prevChildFibers: Nullable<WidgetFiber>[];
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

  public _Input(e: InputEvent) {}

  protected abstract _Layout(constraint: Constraint): Size;

  protected abstract _Render(): Nullable<Widget> | Nullable<Widget>[];

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

  public Refresh(): void {
    this.root.OnWidgetUpdate(this);
  }

  protected NormalizeOptions(options: OPT): OPT {
    return options;
  }

  private Reconcile(
    oldFiber: WidgetFiber | null,
    newFiber: WidgetFiber | null
  ): WidgetFiber | null {
    if (!oldFiber && newFiber) {
      this.AddChild(newFiber.instance);
      newFiber.instance.$Render();
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
      newFiber!.instance.$Render();

      oldFiber!.instance.Free();
      return newFiber;
    }

    // FIXME 需要key来处理强制刷新的情况
    // TODO 实现memo机制？

    oldFiber!.options = newFiber!.options;
    oldFiber!.instance.options = newFiber!.instance.options;
    oldFiber!.instance.$Render();
    return oldFiber;
  }

  private ReconcileChildren(
    root: Widget,
    oldChildren: Nullable<WidgetFiber>[],
    newChildren: Nullable<WidgetFiber>[]
  ): Nullable<WidgetFiber>[] {
    const maxCount = Math.max(oldChildren.length, newChildren.length);

    const children: Nullable<WidgetFiber>[] = [];
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

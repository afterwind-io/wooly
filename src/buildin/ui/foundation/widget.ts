import { Entity, EntitySignals } from "../../../core/entity";
import { OneTimeCachedGetter } from "../../../util/cachedGetter";
import { Nullable } from "../../../util/common";
import { Constraint } from "../common/constraint";
import { Size } from "../common/types";
import { WidgetRoot } from "../root";
import { CommonWidgetOptions, WidgetElement, WidgetRenderables } from "./types";

export function CreateContext() {
  // TODO 生成context组件，如何引用？如何刷新引用组件？
}

interface WidgetFragmentFiber {
  type: "fragment";
  children: WidgetFiber[];
}

interface WidgetClassFiber {
  type: Function;
  options: CommonWidgetOptions;
  children: WidgetFiber[];
  instance: Widget;
}

type WidgetFiber = WidgetFragmentFiber | WidgetClassFiber;

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

  private _fiber: WidgetClassFiber;

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

  @OneTimeCachedGetter
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

  public $Reconcile(): WidgetFiber {
    const widgets = this._Render();

    let childWidgets: WidgetElement[];
    if (Array.isArray(widgets)) {
      childWidgets = widgets;
    } else if (widgets) {
      childWidgets = [widgets];
    } else {
      childWidgets = [];
    }

    const prevFiber = this._fiber;
    let prevChildFibers: WidgetFiber[];
    if (prevFiber) {
      prevChildFibers = prevFiber.children;
    } else {
      prevChildFibers = [];
    }

    const children = this.Reconcile(prevChildFibers, childWidgets);
    this._fiber = {
      type: this.constructor,
      options: this.options,
      children,
      instance: this,
    };
    return this._fiber;
  }

  public _Input(e: InputEvent) {}

  protected abstract _Layout(constraint: Constraint): Size;

  protected abstract _Render(): WidgetRenderables;

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
    const child = this.child;
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
    oldFibers: WidgetFiber[],
    newChildren: WidgetElement[]
  ): WidgetFiber[] {
    // NOTE 其实这个场景可以使用Levenshtein distance计算，但计算复杂度过高了

    const oldChildCount = oldFibers.length;
    const newChildCount = newChildren.length;

    const maxCount = Math.max(oldChildCount, newChildCount);
    if (maxCount === 0) {
      return [];
    }

    const newChildFibers: WidgetFiber[] = [];
    for (let i = 0; i < maxCount; i++) {
      const oldFiber = oldFibers[i];
      const newChild = newChildren[i];

      let newChildFiber: WidgetFiber | null = this.ReconcileChild(
        oldFiber,
        newChild
      );

      if (newChildFiber) {
        newChildFibers.push(newChildFiber);
      }
    }

    return newChildFibers;
  }

  private ReconcileChild(
    oldFiber: WidgetFiber | undefined,
    newChild: WidgetElement
  ): WidgetFiber | null {
    if (!oldFiber) {
      // 如果老节点不存在，那么说明新渲染的节点比原有的多

      if (!newChild) {
        // 如果新节点也不存在，那么说明新节点为null，则无需处理
        return null;
      }

      // 接下来的新节点都应为追加操作
      return this.ReconcileAppendChild(newChild);
    }

    if (!newChild) {
      // 如果老节点存在，但新节点不存在，无论是否遍历完成，均销毁老节点
      this.ReconcileRemoveChild(oldFiber);
      return null;
    }

    const oldFiberType = oldFiber.type;

    if (Array.isArray(newChild)) {
      if (oldFiberType === "fragment") {
        return this.ReconcileChildArray(oldFiber.children, newChild);
      }

      this.ReconcileRemoveChildClass(oldFiber);
      return this.ReconcileInsertChild(oldFiber, newChild);
    }

    if (oldFiberType !== newChild._fiber.type) {
      this.ReconcileRemoveChild(oldFiber);
      return this.ReconcileInsertChild(oldFiber, newChild);
    }

    if (oldFiber.options.key !== newChild.options.key) {
      this.ReconcileRemoveChildClass(oldFiber);
      return this.ReconcileInsertChild(oldFiber, newChild);
    }

    const newFiber = (newChild as Widget)._fiber;
    oldFiber.instance.options = newFiber.instance.options;
    return oldFiber.instance.$Reconcile();
  }

  private ReconcileChildArray(
    oldFibers: WidgetFiber[],
    newChildren: WidgetElement[]
  ): WidgetFragmentFiber {
    const newChildFibers: WidgetFiber[] = [];

    // TODO
    const oldChildCount = oldFibers.length;
    const newChildCount = newChildren.length;
    const maxCount = Math.max(oldChildCount, newChildCount);

    const reservedFibers: Nullable<WidgetFiber>[] = [];
    let lastReservedIndex: number = -1;
    for (let i = 0; i < maxCount; i++, lastReservedIndex++) {
      const oldFiber = oldFibers[i];
      const newChild = newChildren[i];
    }

    return {
      type: "fragment",
      children: newChildFibers,
    };
  }

  private ReconcileAppendChild(child: WidgetElement): WidgetFiber {
    if (!child) {
      throw new Error("[wooly] Child to be appended should not be null.");
    }

    if (Array.isArray(child)) {
      return this.ReconcileAppendChildArray(child);
    } else {
      this.AddChild(child);
      return child.$Reconcile();
    }
  }

  private ReconcileAppendChildArray(
    child: WidgetElement[]
  ): WidgetFragmentFiber {
    const childFibers: WidgetFiber[] = [];
    const fragmentFiber: WidgetFragmentFiber = {
      type: "fragment",
      children: childFibers,
    };

    for (const element of child) {
      if (!element) {
        continue;
      }

      if (Array.isArray(element)) {
        childFibers.push(this.ReconcileAppendChildArray(element));
      } else {
        this.AddChild(element);
        childFibers.push(element.$Reconcile());
      }
    }

    return fragmentFiber;
  }

  private ReconcileInsertChild(
    oldFiber: WidgetFiber,
    newChild: WidgetElement
  ): WidgetFiber {
    if (!newChild) {
      throw new Error("[wooly] Child to be inserted should not be null.");
    }

    let anchor: Widget;
    if (oldFiber.type === "fragment") {
      anchor = FindLastChild(oldFiber);
    } else {
      anchor = oldFiber.instance;
    }

    if (Array.isArray(newChild)) {
      return this.ReconcileInsertChildArray(newChild, anchor).fiber;
    } else {
      this.InsertChild(newChild, anchor);
      return newChild!.$Reconcile();
    }
  }

  private ReconcileInsertChildArray(
    newChild: WidgetElement[],
    anchor: Widget
  ): { fiber: WidgetFragmentFiber; lastChild: Widget } {
    const childFibers: WidgetFiber[] = [];

    for (const child of newChild) {
      if (!child) {
        continue;
      }

      if (Array.isArray(child)) {
        const { fiber: subChildFibers, lastChild: lastSubChild } =
          this.ReconcileInsertChildArray(child, anchor);
        anchor = lastSubChild;

        childFibers.push(subChildFibers);
      } else {
        this.InsertChild(child, anchor);
        anchor = child;

        childFibers.push(child.$Reconcile());
      }
    }

    return {
      fiber: { type: "fragment", children: childFibers },
      lastChild: anchor,
    };
  }

  private ReconcileRemoveChild(fiber: WidgetFiber): void {
    if (fiber.type === "fragment") {
      this.ReconcileRemoveChildArray(fiber);
    } else {
      this.ReconcileRemoveChildClass(fiber);
    }
  }

  private ReconcileRemoveChildArray(fiber: WidgetFragmentFiber): void {
    for (const child of fiber.children) {
      if (child.type === "fragment") {
        this.ReconcileRemoveChildArray(child);
      } else {
        child.instance.Free();
      }
    }
  }

  private ReconcileRemoveChildClass(fiber: WidgetClassFiber): void {
    fiber.instance.Free();
  }
}

function FindLastChild(fiber: WidgetFragmentFiber): Widget {
  let target: WidgetFiber | undefined = fiber.children.at(-1);
  while (target) {
    if (target.type !== "fragment") {
      return target.instance;
    }

    target = target.children.at(-1);
  }

  throw new Error("[wooly] Should not exist empty WidgetFragmentFiber.");
}

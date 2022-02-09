import { Entity, EntitySignals } from "../../../core/entity";
import { OneTimeCachedGetter } from "../../../util/cachedGetter";
import { Vector2 } from "../../../util/vector2";
import { Constraint } from "../common/constraint";
import { Size } from "../common/types";
import { WidgetRoot } from "../root";
import { WidgetContext, WidgetContextConstructor } from "./context";
import {
  CommonWidgetOptions,
  SizableWidgetOptions,
  WidgetElement,
} from "./types";

type NonNull<T> = T extends null ? never : T;

interface WidgetFragmentFiber {
  type: "fragment";
  children: WidgetClassFiber[];
}

interface WidgetClassFiber {
  type: Function;
  options: CommonWidgetOptions;
  child: WidgetFiber | null;
  instance: Widget;
}

type WidgetFiber = WidgetFragmentFiber | WidgetClassFiber;

type CommonWidgetOptionsMixin<OPT extends {}> = CommonWidgetOptions & OPT;

export abstract class Widget<
  OPT = {},
  SIG extends EntitySignals = EntitySignals
> extends Entity<SIG> {
  public abstract readonly name: string;
  public readonly childSizeIndependent: boolean = false;

  public _intrinsicWidth: number = 0;
  public _intrinsicHeight: number = 0;
  public _isLayoutDirty: boolean = false;
  public _prevConstraint: Constraint = new Constraint();

  public options: CommonWidgetOptionsMixin<OPT>;

  private _fiber: WidgetClassFiber;
  private _contexts: Map<WidgetContextConstructor, WidgetContext>;

  public constructor(options: CommonWidgetOptionsMixin<OPT>) {
    super();

    this.options = this.NormalizeOptions(options);

    this._fiber = {
      type: this.constructor,
      options,
      child: null,
      instance: this,
    };
    this._contexts = new Map();
  }

  /**
   * 判断该widget是否为一个`Relayout Boundary`。
   *
   * `Relayout Boundary`意味着无论内部子节点如何变化，都不会影响其大小。
   * 因此其子节点的大小布局变化将不会影响`Relayout Boundary`之外的树的布局结构。
   *
   * 具备以下特征的`Widget`可视为一个`Relayout Boundary`：
   *
   * - 具有`childSizeIndependent`标记，显式指出自己的大小不受子代影响；
   *
   * - 自身的宽高均为非`Infinity`的指定大小；
   *
   * - `Widget`的宽高分别受到严格约束，或始终依赖约束的最大值；
   */
  public get isRelayoutBoundary(): boolean {
    if (this.childSizeIndependent) {
      return true;
    }

    // TODO
    // 下面这种写法是否是比较快速的实现方式？
    // 一个比较常见的"shrink"节点需要走完所有逻辑才能知道是非`Relayout Boundary`

    const { width, height } = this.options as unknown as SizableWidgetOptions;
    if (
      typeof width === "number" &&
      width !== Infinity &&
      typeof height === "number" &&
      height !== Infinity
    ) {
      return true;
    }

    const { isHeightTight, isWidthTight } = this._prevConstraint;
    if (
      (isWidthTight || width === "stretch") &&
      (isHeightTight || height === "stretch")
    ) {
      return true;
    }

    return false;
  }

  @OneTimeCachedGetter
  protected get root(): WidgetRoot {
    let root = null;
    this.Bubble((node) => {
      if (node instanceof WidgetRoot) {
        root = node;
        return false;
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

  public $Reconcile(): WidgetClassFiber {
    const ref = this.options.ref;
    if (ref) {
      ref.current = this;
    }

    const prevFiber = this._fiber.child;
    const newWidget = this._Render();

    const child = this.ReconcileChild(prevFiber, newWidget);
    this._fiber = {
      type: this.constructor,
      options: this.options,
      child,
      instance: this,
    };
    return this._fiber;
  }

  protected abstract _Layout(constraint: Constraint): Size;

  protected abstract _Render(): WidgetElement;

  public FindNearestParent<T extends Widget = Widget>(
    predicate: (widget: Widget) => boolean | undefined
  ): T | null {
    let parent: Widget | null = null;

    this.Bubble((node) => {
      if (!(node instanceof Widget)) {
        return;
      }

      if (predicate(node)) {
        parent = node;
        return false;
      }
    });

    return parent;
  }

  public FindNearestContext(
    type: WidgetContextConstructor
  ): WidgetContext | null {
    let context: WidgetContext | null | undefined = this._contexts.get(type);
    if (context) {
      return context;
    }

    context = this.FindNearestParent<WidgetContext>(
      (widget) => widget instanceof type
    );
    if (!context) {
      return null;
    }

    this._contexts.set(type, context);
    return context;
  }

  /**
   * @override
   */
  public GetDisplayName(): string {
    const tag = this.options.tag;

    const name = this.name || this.constructor.name;
    if (!tag) {
      return name;
    }

    return `${tag} (${name})`;
  }

  /**
   * @override
   */
  public HitTest(screenPoint: Vector2): boolean {
    return super.HitTest(
      screenPoint,
      this._intrinsicWidth,
      this._intrinsicHeight
    );
  }

  public Refresh(): void {
    this.root.OnWidgetUpdate(this);
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

  protected NormalizeOptions(options: OPT): OPT {
    return options;
  }

  private ReconcileChild(
    oldFiber: WidgetFiber | null,
    newWidget: WidgetElement
  ): WidgetFiber | null {
    if (!oldFiber) {
      // 如果老节点不存在，那么说明新渲染的节点比原有的多

      if (!newWidget) {
        // 如果新节点也不存在，那么说明新节点为null，则无需处理
        return null;
      }

      // 接下来的新节点都应为追加操作
      return this.ReconcileAppendChild(newWidget);
    }

    if (!newWidget) {
      // 如果老节点存在，但新节点不存在，无论是否遍历完成，均销毁老节点
      this.ReconcileRemoveChild(oldFiber);
      return null;
    }

    const oldFiberType = oldFiber.type;

    if (Array.isArray(newWidget)) {
      if (oldFiberType === "fragment") {
        return this.ReconcileChildArray(oldFiber.children, newWidget);
      }

      this.ReconcileRemoveChildClass(oldFiber);
      return this.ReconcileInsertChild(oldFiber, newWidget);
    }

    if (oldFiberType !== newWidget._fiber.type) {
      this.ReconcileRemoveChild(oldFiber);
      return this.ReconcileInsertChild(oldFiber, newWidget);
    }

    if (oldFiber.options.key !== newWidget.options.key) {
      this.ReconcileRemoveChildClass(oldFiber);
      return this.ReconcileInsertChild(oldFiber, newWidget);
    }

    return this.ReconcileUpdateChild(oldFiber, newWidget);
  }

  private ReconcileChildArray(
    oldFibers: WidgetClassFiber[],
    newWidgets: (Widget | null)[]
  ): WidgetFragmentFiber {
    const newWidgetsFibers: WidgetClassFiber[] = [];

    let oldFibersTop: number = 0;
    let oldFibersBottom: number = oldFibers.length - 1;
    let newWidgetsTop: number = 0;
    let newWidgetsBottom: number = newWidgets.length - 1;

    let prevWidgetFiber: WidgetClassFiber | null = null;

    // 从列表头部开始顺序检索，收集所有可以直接复用的节点
    while (
      oldFibersTop <= oldFibersBottom &&
      newWidgetsTop <= newWidgetsBottom
    ) {
      const oldFiber = oldFibers[oldFibersTop];
      const newWidget = newWidgets[newWidgetsTop];

      if (!oldFiber || !newWidget) {
        break;
      }

      if (oldFiber.type !== newWidget._fiber.type) {
        break;
      }

      const oldKey = oldFiber.options.key;
      const newKey = newWidget.options.key;

      if (oldKey !== newKey) {
        break;
      }

      newWidgetsFibers.push(this.ReconcileUpdateChild(oldFiber, newWidget));
      prevWidgetFiber = oldFiber;

      oldFibersTop++;
      newWidgetsTop++;
    }

    // 从列表尾部开始逆序搜索，收集所有可以直接复用的节点
    while (
      oldFibersTop <= oldFibersBottom &&
      newWidgetsTop <= newWidgetsBottom
    ) {
      const oldFiber = oldFibers[oldFibersBottom];
      const newWidget = newWidgets[newWidgetsBottom];

      if (!oldFiber || !newWidget) {
        break;
      }

      if (oldFiber.type !== newWidget._fiber.type) {
        break;
      }

      const oldKey = oldFiber.options.key;
      const newKey = newWidget.options.key;

      if (oldKey !== newKey) {
        break;
      }

      oldFibersBottom--;
      newWidgetsBottom--;
    }

    // 为剩余的所有旧fiber进行索引
    const hasPreservedFibers = oldFibersTop <= oldFibersBottom;
    let oldKeyMap: Map<CommonWidgetOptions["key"], WidgetClassFiber> | null =
      null;
    if (hasPreservedFibers) {
      oldKeyMap = new Map();

      while (oldFibersTop <= oldFibersBottom) {
        const oldFiber = oldFibers[oldFibersTop];
        const oldKey = oldFiber.options.key;

        if (oldKey == null) {
          console.warn(
            `[wooly] Each child "${oldFiber.type.name}" widgets in "${this.constructor.name}"` +
              ` must have a unique key,` +
              " and the current node had been discarded."
          );

          // 未设定key的节点直接丢弃
          oldFiber.instance.Free();
        } else {
          oldKeyMap.set(oldKey, oldFiber);
        }

        oldFibersTop++;
      }
    }

    // 为剩余的所有新widget查找可复用fiber
    while (newWidgetsTop <= newWidgetsBottom) {
      const newWidget = newWidgets[newWidgetsTop];
      if (newWidget) {
        const newKey = newWidget.options.key;

        let oldFiber: WidgetClassFiber | null = oldKeyMap?.get(newKey) || null;
        let newChildFiber: WidgetClassFiber;

        if (oldFiber == null) {
          newChildFiber = this.ReconcileInsertChild(
            prevWidgetFiber,
            newWidget
          ) as WidgetClassFiber;
        } else {
          newChildFiber = this.ReconcileMoveChild(
            oldFiber,
            prevWidgetFiber,
            newWidget
          );
          oldKeyMap!.delete(newKey);
        }

        newWidgetsFibers.push(newChildFiber);
        prevWidgetFiber = newChildFiber;
      }

      newWidgetsTop++;
    }

    // 清除未被复用的旧fiber
    if (hasPreservedFibers && oldKeyMap && oldKeyMap.size !== 0) {
      oldKeyMap.forEach((fiber) => {
        fiber.instance.Free();
      });
    }

    console.assert(oldFibersTop == oldFibersBottom + 1);
    console.assert(newWidgetsTop == newWidgetsBottom + 1);
    console.assert(
      newWidgets.length - newWidgetsTop == oldFibers.length - oldFibersTop
    );

    // 追加之前收集的尾部可复用的节点
    oldFibersBottom = oldFibers.length - 1;
    newWidgetsBottom = newWidgets.length - 1;
    while (
      oldFibersTop <= oldFibersBottom &&
      newWidgetsTop <= newWidgetsBottom
    ) {
      const oldFiber = oldFibers[oldFibersTop];
      const newWidget = newWidgets[newWidgetsTop];
      newWidgetsFibers.push(this.ReconcileUpdateChild(oldFiber, newWidget!));

      oldFibersTop++;
      newWidgetsTop++;
    }

    return {
      type: "fragment",
      children: newWidgetsFibers,
    };
  }

  private ReconcileUpdateChild(
    oldFiber: WidgetClassFiber,
    newWidget: Widget
  ): WidgetClassFiber {
    const newFiber = newWidget._fiber;
    oldFiber.instance.options = newFiber.instance.options;
    return oldFiber.instance.$Reconcile();
  }

  private ReconcileAppendChild(child: NonNull<WidgetElement>): WidgetFiber {
    if (!Array.isArray(child)) {
      this.AddChild(child);
      return child.$Reconcile();
    }

    const childFibers: WidgetClassFiber[] = [];
    for (const element of child) {
      if (!element) {
        continue;
      }

      this.AddChild(element);
      childFibers.push(element.$Reconcile());
    }

    return {
      type: "fragment",
      children: childFibers,
    };
  }

  private ReconcileInsertChild(
    oldFiber: WidgetFiber | null,
    newChild: NonNull<WidgetElement>
  ): WidgetFiber {
    let anchor: Widget | null;
    if (!oldFiber) {
      anchor = null;
    } else if (oldFiber.type === "fragment") {
      anchor = oldFiber.children.at(-1)!.instance;
    } else {
      anchor = oldFiber.instance;
    }

    if (!Array.isArray(newChild)) {
      this.InsertChild(newChild, anchor);
      return newChild.$Reconcile();
    }

    const childFibers: WidgetClassFiber[] = [];
    for (const child of newChild) {
      if (!child) {
        continue;
      }

      this.InsertChild(child, anchor);
      childFibers.push(child.$Reconcile());

      anchor = child;
    }

    return { type: "fragment", children: childFibers };
  }

  private ReconcileMoveChild(
    targetFiber: WidgetClassFiber,
    anchor: WidgetClassFiber | null,
    newWidget: Widget
  ): WidgetClassFiber {
    const targetWidget = targetFiber.instance;
    const anchorWidget = anchor?.instance || null;
    this.MoveChild(targetWidget, anchorWidget);

    return this.ReconcileUpdateChild(targetFiber, newWidget);
  }

  private ReconcileRemoveChild(fiber: WidgetFiber): void {
    if (fiber.type !== "fragment") {
      return this.ReconcileRemoveChildClass(fiber);
    }

    for (const child of fiber.children) {
      child.instance.Free();
    }
  }

  private ReconcileRemoveChildClass(fiber: WidgetClassFiber): void {
    fiber.instance.Free();
  }
}

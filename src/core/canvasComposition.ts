import { Vector2 } from "../util/vector2";
import { ViewportManager } from "./manager/viewport";
import { CanvasItem } from "./canvasItem";
import { CanvasLayer } from "./canvasLayer";
import { Tangible } from "./tangible";
import { Node } from "./node";
import { GlobalComputedProperty } from "../util/globalComputedProperty";
import { Matrix2d } from "../util/matrix2d";
import { PersistCached } from "../util/persistCachedGetter";

/**
 * CanvasComposition
 */
export class CanvasComposition extends Tangible {
  public readonly name: string = "CanvasComposition";

  public parent: CanvasItem | CanvasLayer | CanvasComposition | null = null;

  protected _screenSpaceTransform: GlobalComputedProperty<
    CanvasComposition,
    Matrix2d
  > = new ScreenSpaceTransform(this, Matrix2d.Identity());

  public constructor(public readonly index: number) {
    super();
  }

  @PersistCached
  public get parentComposition(): CanvasComposition | null {
    let composition: CanvasComposition | null = null;

    this.Bubble((node) => {
      if (node instanceof CanvasComposition) {
        composition = node;
        return false;
      }
    });

    return composition;
  }

  @PersistCached
  public get parentLayer(): number {
    let layer = 0;

    this.Bubble((node) => {
      if (node instanceof CanvasComposition) {
        return false;
      }

      if (node instanceof CanvasLayer) {
        layer = node.index;
        return false;
      }
    });

    return layer;
  }

  public get globalOpacity(): number {
    const parent = this.parent;

    if (!parent) {
      return 1;
    }

    if (parent instanceof CanvasLayer) {
      return 1;
    }

    return parent.globalOpacity;
  }

  public get globalVisible(): boolean {
    const parent = this.parent;

    if (!parent) {
      return true;
    }

    if (parent instanceof CanvasLayer) {
      return true;
    }

    return parent.globalVisible;
  }

  public get globalZIndex(): number {
    const parent = this.parent;

    if (!parent) {
      return 0;
    }

    if (parent instanceof CanvasLayer) {
      return 0;
    }

    return parent.globalZIndex;
  }

  /**
   * 不包含composition默认layer0的viewport变换的屏幕空间变换矩阵，
   * 用于获取自身在屏幕上的位置，及为子代layer计算屏幕位置提供一个根。
   *
   * 这个local值是在ScreenSpaceTransform的global计算中同时写入的。
   */
  public get selfScreenTransform(): Matrix2d {
    return this._screenSpaceTransform.local;
  }

  protected _Ready(): void {
    const viewport = ViewportManager.Add(this.index, 0);
    viewport.AddListener(() => {
      this._screenSpaceTransform.Notify();
    });
  }

  protected _Destroy(): void {
    ViewportManager.Remove(this.index, 0);
  }

  /**
   * @override
   */
  public ConvertScreenToLocalSpace(screenPoint: Vector2): Vector2 {
    return screenPoint.Transform(this.selfScreenTransform.Invert());
  }

  /**
   * @override
   */
  public ConvertToScreenSpace(localPoint: Vector2 = Vector2.Zero): Vector2 {
    return localPoint.Transform(this.selfScreenTransform);
  }

  public SetSize(size: Vector2): this {
    const { x, y } = size;
    this.width = x;
    this.height = y;

    return this;
  }
}

class ScreenSpaceTransform extends GlobalComputedProperty<
  CanvasComposition,
  Matrix2d
> {
  public ComputeGlobalValue(): Matrix2d {
    const host = this.host;

    let parentScreenTransform: Matrix2d;
    if (!host.parent) {
      parentScreenTransform = Matrix2d.Identity();
    } else {
      parentScreenTransform = host.parent.screenTransform;
    }

    const localTransform = host.localTransform;
    const selfScreenTransform = parentScreenTransform.Multiply(localTransform);

    // 向local写入一个不包含viewport变换的纯屏幕空间变换，用于外部快速获取，避免重复计算
    // @ts-expect-error TS2341 private property
    this._local = selfScreenTransform;

    const viewport = ViewportManager.Get(host.index, 0);
    const viewportTransform = viewport.GetViewportTransform();
    return selfScreenTransform.Multiply(viewportTransform);
  }

  public GetPropertyInstance(
    node: Node
  ): GlobalComputedProperty<CanvasComposition, Matrix2d> | null {
    // @ts-expect-error TS2341 protected property
    return (node as Tangible)._screenSpaceTransform;
  }
}

import { Matrix2d } from "../util/matrix2d";
import { CanvasComposition } from "./canvasComposition";
import { Tangible } from "./tangible";
import { ViewportManager } from "./manager/viewport";
import { OneTimeCachedGetter } from "../util/cachedGetter";
import { GlobalComputedProperty } from "../util/globalComputedProperty";
import { Node } from "./node";
import { CanvasItem } from "./canvasItem";

/**
 * CanvasLayer
 */
export class CanvasLayer extends Tangible {
  public readonly name: string = "CanvasLayer";

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * The pointer to the parent node.
   */
  public parent: CanvasItem | CanvasLayer | CanvasComposition | null = null;

  protected _screenSpaceTransform: GlobalComputedProperty<Tangible, Matrix2d> =
    new ScreenSpaceTransform(this, Matrix2d.Identity());

  public constructor(public readonly index: number) {
    super();
  }

  @OneTimeCachedGetter
  public get parentComposition(): CanvasComposition {
    let composition: CanvasComposition | null = null;

    this.Bubble((node) => {
      if (node instanceof CanvasComposition) {
        composition = node;
        return false;
      }
    });

    console.assert(composition != null, "没有找到根composition");
    return composition!;
  }

  /**
   * @override
   */
  public get globalTransform(): Matrix2d {
    return this.parentComposition.globalTransform;
  }

  public _Ready() {
    const viewport = ViewportManager.Add(
      this.parentComposition.index,
      this.index
    );
    viewport.AddListener(() => {
      this._screenSpaceTransform.Notify();
    });
  }

  public _Destroy() {
    ViewportManager.Remove(this.parentComposition.index, this.index);
  }
}

class ScreenSpaceTransform extends GlobalComputedProperty<
  CanvasLayer,
  Matrix2d
> {
  public ComputeGlobalValue(): Matrix2d {
    const host = this.host;

    let parentScreenTransform: Matrix2d;
    if (!host.parent) {
      parentScreenTransform = Matrix2d.Identity();
    } else {
      parentScreenTransform = host.parentComposition.selfScreenTransform;
    }

    const localTransform = host.localTransform;

    const viewport = ViewportManager.Get(
      host.parentComposition.index,
      host.index
    );
    const viewportTransform = viewport.GetViewportTransform();

    return parentScreenTransform
      .Multiply(localTransform)
      .Multiply(viewportTransform);
  }

  public GetPropertyInstance(
    node: Node
  ): GlobalComputedProperty<CanvasLayer, Matrix2d> | null {
    // @ts-expect-error TS2341 protected property
    return (node as Tangible)._screenSpaceTransform;
  }
}

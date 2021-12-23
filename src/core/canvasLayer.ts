import { Matrix2d } from "../util/matrix2d";
import { CanvasComposition } from "./canvasComposition";
import { Transform } from "./transform";
import { ViewportRegistry } from "./viewport";

/**
 * CanvasLayer
 */
export class CanvasLayer extends Transform {
  public readonly name: string = "CanvasLayer";

  private cachedGlobalComposition: CanvasComposition | null = null;

  public constructor(public readonly index: number) {
    super();
  }

  public get GlobalComposition(): CanvasComposition {
    let composition = this.cachedGlobalComposition;

    if (composition != null) {
      return composition;
    }

    this.Bubble((node) => {
      if (node instanceof CanvasComposition) {
        composition = node;
        return true;
      }
    });

    console.assert(composition != null, "没有找到根composition");

    this.cachedGlobalComposition = composition;
    return composition!;
  }

  public get globalTransformMatrix(): Matrix2d {
    return this.GlobalComposition!.globalTransformMatrix;
  }

  public _Ready() {
    ViewportRegistry.Add(this.index);
  }

  public _Destroy() {
    ViewportRegistry.Remove(this.index);
  }
}

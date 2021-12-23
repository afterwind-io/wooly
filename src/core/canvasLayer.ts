import { Matrix2d } from "../util/matrix2d";
import { CanvasComposition } from "./canvasComposition";
import { Transform } from "./transform";
import { ViewportManager } from "./manager/viewport";

/**
 * CanvasLayer
 */
export class CanvasLayer extends Transform {
  public readonly name: string = "CanvasLayer";

  private cachedGlobalComposition: CanvasComposition | null = null;

  public constructor(public readonly index: number) {
    super();
  }

  public get globalComposition(): CanvasComposition {
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
    return this.globalComposition!.globalTransformMatrix;
  }

  public _Ready() {
    ViewportManager.Add(this.globalComposition.index, this.index);
  }

  public _Destroy() {
    ViewportManager.Remove(this.globalComposition.index, this.index);
  }
}

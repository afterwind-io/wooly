import { ReadonlyVector2, Vector2 } from "../util/vector2";
import { ViewportManager } from "./manager/viewport";
import { RenderItem } from "./renderItem";
import { Transform } from "./transform";

/**
 * CanvasComposition
 */
export class CanvasComposition extends Transform {
  public readonly name: string = "CanvasComposition";

  public size: ReadonlyVector2 = Vector2.Zero;

  public constructor(public readonly index: number) {
    super();
  }

  public get globalComposition(): number {
    const parent = this.parent;
    if (parent) {
      /**
       * 当前的所有parent只可能是 CanvasComposition | CanvasLayer | RenderItem
       * 因此必有globalComposition
       */
      // @ts-ignore
      return parent.globalComposition;
    }

    return 0;
  }

  public get globalLayer(): number {
    const parent = this.parent;
    if (parent instanceof RenderItem) {
      return parent.globalLayer;
    }

    return 0;
  }

  public get globalZIndex(): number {
    const parent = this.parent;
    if (parent instanceof RenderItem) {
      return parent.globalZIndex;
    }

    return 0;
  }

  public SetSize(size: Vector2): this {
    return (this.size = size), this;
  }

  protected _Ready(): void {
    ViewportManager.Add(this.index, 0);
  }

  protected _Destroy(): void {
    ViewportManager.Remove(this.index, 0);
  }
}

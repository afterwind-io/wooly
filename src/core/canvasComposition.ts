import { ReadonlyVector2, Vector2 } from "../util/vector2";
import { ViewportManager } from "./manager/viewport";
import { CanvasItem } from "./canvasItem";
import { CanvasLayer } from "./canvasLayer";
import { Transform } from "./transform";

/**
 * CanvasComposition
 */
export class CanvasComposition extends Transform {
  public readonly name: string = "CanvasComposition";

  public parent: CanvasItem | CanvasLayer | CanvasComposition | null = null;
  public size: ReadonlyVector2 = Vector2.Zero;

  public constructor(public readonly index: number) {
    super();
  }

  public get globalComposition(): number {
    const parent = this.parent;

    if (!parent) {
      return this.index;
    }

    if (parent instanceof CanvasLayer) {
      return parent.globalComposition.index;
    }

    return parent.globalComposition;
  }

  public get globalLayer(): number {
    const parent = this.parent;

    if (!parent) {
      return 0;
    }

    if (parent instanceof CanvasLayer) {
      return parent.index;
    }

    return parent.globalLayer;
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

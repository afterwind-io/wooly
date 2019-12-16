import { CanvasTreeItem } from "./canvasTreeItem";
import { CachedList } from "./struct/cachedList";

function ZIndexSortFunction(a: number, b: number): number {
  return a - b;
}

export class CanvasTree {
  private layerMap: { [key: number]: CachedList<CanvasTreeItem> } = {};
  private layers: number[] = [];

  private isDirty: boolean = false;

  public Draw(root: CanvasTreeItem, ctx: CanvasRenderingContext2D) {
    this.Clear();

    // @ts-ignore
    root.Traverse((node: CanvasTreeItem) => {
      node.$Freeze();
      this.Add(node as CanvasTreeItem);
    });

    this.Traverse((node: CanvasTreeItem) => {
      node.$Draw(ctx);
      node.$Melt();
    });
  }

  private Add(value: CanvasTreeItem) {
    const key = value.GlobalZIndex;

    let list: CachedList<CanvasTreeItem>;
    if (this.layers.includes(key)) {
      list = this.layerMap[key];
    } else {
      this.isDirty = true;
      this.layers.push(key);
      list = this.layerMap[key] = new CachedList<CanvasTreeItem>();
    }

    list.Push(value);
  }

  private Clear() {
    for (const zIndex of this.layers) {
      this.layerMap[zIndex].Clear();
    }

    this.layers.length = 0;
  }

  private Traverse(cb: (value: CanvasTreeItem) => void) {
    if (this.isDirty) {
      this.layers.sort(ZIndexSortFunction);
      this.isDirty = false;
    }

    for (const key of this.layers) {
      const list = this.layerMap[key];
      list.Traverse(cb);
    }
  }
}

// @ts-ignore
window.CanvasTree = CanvasTree;

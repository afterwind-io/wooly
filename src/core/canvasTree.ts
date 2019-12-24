import { CanvasTreeItem } from "./canvasTreeItem";
import { Viewport } from "./viewport";
import { GetTransformMatrix } from "../util/common";
import { OrderedLinkedList } from "./struct/orderedLinkedList";
import { LinkedList } from "./struct/linkedList";

export class CanvasTree {
  private layerMap: OrderedLinkedList<
    LinkedList<CanvasTreeItem>
  > = new OrderedLinkedList();

  public Draw(root: CanvasTreeItem, ctx: CanvasRenderingContext2D) {
    this.ResetCanvas(ctx);
    this.RebuildTree(root);

    this.Traverse((node: CanvasTreeItem) => {
      node.$Draw(ctx);
      node.$Melt();
    });
  }

  private Add(value: CanvasTreeItem) {
    const key = value.GlobalZIndex;

    let layer = this.layerMap.GetByKey(key);
    if (layer == null) {
      layer = new LinkedList<CanvasTreeItem>();
      this.layerMap.Insert(layer, key);
    }

    layer.Push(value);
  }

  private Clear() {
    this.layerMap.Traverse(layer => layer.Clear());
  }

  private RebuildTree(root: CanvasTreeItem) {
    this.Clear();

    // @ts-ignore
    root.Traverse((node: CanvasTreeItem) => {
      node.$Freeze();
      this.Add(node as CanvasTreeItem);
    });
  }

  private ResetCanvas(ctx: CanvasRenderingContext2D) {
    const canvas = ctx.canvas;
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    ctx.transform(
      ...GetTransformMatrix(Viewport.Current.Offset, 0, Viewport.Current.Zoom)
    );
  }

  private Traverse(cb: (value: CanvasTreeItem) => void) {
    this.layerMap.Traverse(layer => layer.Traverse(cb));
  }
}

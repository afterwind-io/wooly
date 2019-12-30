import { CanvasTreeItem } from "./canvasTreeItem";
import { ViewportRegistry } from "./viewport";
import { GetTransformMatrix } from "../util/common";
import { OrderedLinkedList } from "./struct/orderedLinkedList";
import { LinkedList } from "./struct/linkedList";

export class CanvasTree {
  private layerMap: OrderedLinkedList<
    OrderedLinkedList<LinkedList<CanvasTreeItem>>
  > = new OrderedLinkedList();

  public constructor() {
    // FIXME 是否应该如此初始化默认layer？
    ViewportRegistry.Add(0);
  }

  public Draw(root: CanvasTreeItem, ctx: CanvasRenderingContext2D) {
    this.ResetCanvas(ctx);
    this.ClearTree();
    this.RebuildTree(root);
    this.DrawTree(ctx);
  }

  private Add(value: CanvasTreeItem, layerIndex: number) {
    let layer = this.layerMap.GetByKey(layerIndex);
    if (layer == null) {
      layer = new OrderedLinkedList<LinkedList<CanvasTreeItem>>();
      this.layerMap.Insert(layer, layerIndex);
    }

    let zIndex = value.GlobalZIndex;
    let stack = layer.GetByKey(zIndex);
    if (stack == null) {
      stack = new LinkedList<CanvasTreeItem>();
      layer.Insert(stack, zIndex);
    }

    stack.Push(value);
  }

  private ClearTree() {
    this.layerMap.Traverse(layer => layer.Traverse(stack => stack.Clear()));
  }

  private DrawTree(ctx: CanvasRenderingContext2D) {
    this.layerMap.Traverse((layer, layerIndex) => {
      const viewport = ViewportRegistry.Get(layerIndex!);

      ctx.setTransform(
        ...GetTransformMatrix(viewport.offset, 0, viewport.zoom)
      );

      layer.Traverse(stack =>
        stack.Traverse(node => {
          node.$Draw(ctx);
          node.$Melt();
        })
      );
    });
  }

  private RebuildTree(root: CanvasTreeItem) {
    const layerIndex = root.layer;
    const pendingLayers: CanvasTreeItem[] = [];

    // @ts-ignore
    root.Traverse((node: CanvasTreeItem) => {
      if (node.GlobalLayer !== layerIndex) {
        pendingLayers.push(node);
        return true;
      }

      node.$Freeze();
      this.Add(node as CanvasTreeItem, layerIndex);
    });

    for (const node of pendingLayers) {
      this.RebuildTree(node);
    }
  }

  private ResetCanvas(ctx: CanvasRenderingContext2D) {
    const canvas = ctx.canvas;
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  }
}

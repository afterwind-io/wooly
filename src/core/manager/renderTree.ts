import { OrderedLinkedList } from "../struct/orderedLinkedList";
import { LinkedList } from "../struct/linkedList";
import { RenderItem } from "../renderItem";
import { Transform } from "../transform";
import { CanvasComposition } from "../canvasComposition";
import { CanvasLayer } from "../canvasLayer";
import { ViewportRegistry } from "../viewport";

export const RenderTreeManager = new (class RenderTreeManager {
  public layerMap: OrderedLinkedList<
    OrderedLinkedList<LinkedList<RenderItem>>
  > = new OrderedLinkedList();

  public Init() {
    ViewportRegistry.Add(0);
  }

  public Build(root: CanvasComposition) {
    this.ClearTree();
    this.BuildComposition(root);
  }

  private Add(value: RenderItem, layerIndex: number) {
    let layer = this.layerMap.GetByKey(layerIndex);
    if (layer == null) {
      layer = new OrderedLinkedList<LinkedList<RenderItem>>();
      this.layerMap.Insert(layer, layerIndex);
    }

    let zIndex = value.GlobalZIndex;
    let stack = layer.GetByKey(zIndex);
    if (stack == null) {
      stack = new LinkedList<RenderItem>();
      layer.Insert(stack, zIndex);
    }

    stack.Push(value);
  }

  private BuildComposition(root: CanvasComposition) {
    const rootComposition = root.index;

    root.Traverse<Transform>((node) => {
      if (node instanceof RenderItem) {
        if (!node.enabled || !node.visible) {
          return true;
        }

        node.$Freeze();

        this.BuildTree(rootComposition, 0, node);
        return;
      }

      if (node instanceof CanvasLayer) {
        this.BuildLayer(node, rootComposition);
        return true;
      }

      if (node instanceof CanvasComposition) {
        this.BuildComposition(node);
        return true;
      }

      console.assert(false, "渲染树异常节点类型处理");
    }, true);
  }

  private BuildLayer(root: CanvasLayer, parentComposition: number) {
    const rootLayer = root.index;

    root.Traverse<Transform>((node) => {
      if (node instanceof RenderItem) {
        if (!node.enabled || !node.visible) {
          return true;
        }

        node.$Freeze();

        this.BuildTree(parentComposition, rootLayer, node);
        return;
      }

      if (node instanceof CanvasLayer) {
        this.BuildLayer(node, parentComposition);
        return true;
      }

      if (node instanceof CanvasComposition) {
        this.BuildComposition(node);
        return true;
      }

      console.assert(false, "渲染树异常节点类型处理");
    }, true);
  }

  private BuildTree(composition: number, layer: number, node: Transform) {
    // TODO viewport对应的layer可能跨composition,即viewport0可能控制多个composition的layer0
  }

  private ClearTree() {
    this.layerMap.Traverse((layer) => layer.Traverse((stack) => stack.Clear()));
  }
})();

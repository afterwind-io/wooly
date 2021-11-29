import { OrderedLinkedList } from "../struct/orderedLinkedList";
import { LinkedList } from "../struct/linkedList";
import { RenderItem } from "../renderItem";

export const RenderTreeManager = new (class RenderTreeManager {
  public layerMap: OrderedLinkedList<
    OrderedLinkedList<LinkedList<RenderItem>>
  > = new OrderedLinkedList();

  public Build(root: RenderItem) {
    this.ClearTree();
    this.BuildTree(root);
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

  private BuildTree(root: RenderItem) {
    const rootLayer = root.layer;
    const pendingLayers: RenderItem[] = [];

    // @ts-ignore
    root.Traverse((node: RenderItem) => {
      if (!node.enabled || !node.visible) {
        return true;
      }

      const layer = node.layer;
      if (layer !== 0 && layer !== rootLayer) {
        pendingLayers.push(node);
        return true;
      }

      node.$Freeze();
      this.Add(node as RenderItem, rootLayer);
    });

    for (const node of pendingLayers) {
      this.BuildTree(node);
    }
  }

  private ClearTree() {
    this.layerMap.Traverse((layer) => layer.Traverse((stack) => stack.Clear()));
  }
})();

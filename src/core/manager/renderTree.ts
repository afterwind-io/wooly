import { OrderedLinkedList } from "../struct/orderedLinkedList";
import { LinkedList } from "../struct/linkedList";
import { CanvasItem } from "../canvasItem";
import { Transform } from "../transform";
import { CanvasComposition } from "../canvasComposition";
import { CanvasLayer } from "../canvasLayer";

type RenderList = LinkedList<CompositionContext | CanvasItem>;
type ZIndexStack = OrderedLinkedList<RenderList>;
type LayerStack = OrderedLinkedList<ZIndexStack>;

export class CompositionContext {
  public readonly layerStack: LayerStack = new OrderedLinkedList();

  public constructor(public readonly root: CanvasComposition) {}

  public get globalZIndex(): number {
    return this.root.globalZIndex;
  }

  public AddItem(layer: number, node: CompositionContext | CanvasItem) {
    let layerStack = this.layerStack.GetByKey(layer);
    if (layerStack == null) {
      layerStack = new OrderedLinkedList<RenderList>();
      this.layerStack.Insert(layerStack, layer);
    }

    let zIndex = node.globalZIndex;
    let zIndexStack = layerStack.GetByKey(zIndex);
    if (zIndexStack == null) {
      zIndexStack = new LinkedList<CompositionContext | CanvasItem>();
      layerStack.Insert(zIndexStack, zIndex);
    }

    zIndexStack.Push(node);
  }
}

export const RenderTreeManager = new (class RenderTreeManager {
  public compositionRoot!: CompositionContext;

  public Build(root: CanvasComposition) {
    this.compositionRoot = this.BuildComposition(root);
  }

  private BuildComposition(root: CanvasComposition): CompositionContext {
    const rootComposition = new CompositionContext(root);

    root.Traverse<Transform>((node) => {
      if (node instanceof CanvasItem) {
        if (!node.enabled || !node.visible) {
          return true;
        }

        rootComposition.AddItem(0, node);
        return;
      }

      if (node instanceof CanvasLayer) {
        this.BuildLayer(node, rootComposition);
        return true;
      }

      if (node instanceof CanvasComposition) {
        const childComposition = this.BuildComposition(node);
        rootComposition.AddItem(node.globalLayer, childComposition);
        return true;
      }

      console.assert(false, "渲染树异常节点类型处理");
    }, true);

    return rootComposition;
  }

  private BuildLayer(root: CanvasLayer, parentComposition: CompositionContext) {
    const rootLayer = root.index;

    root.Traverse<Transform>((node) => {
      if (node instanceof CanvasItem) {
        if (!node.enabled || !node.visible) {
          return true;
        }

        parentComposition.AddItem(rootLayer, node);
        return;
      }

      if (node instanceof CanvasLayer) {
        this.BuildLayer(node, parentComposition);
        return true;
      }

      if (node instanceof CanvasComposition) {
        const childComposition = this.BuildComposition(node);
        parentComposition.AddItem(node.globalLayer, childComposition);
        return true;
      }

      console.assert(false, "渲染树异常节点类型处理");
    }, true);
  }
})();

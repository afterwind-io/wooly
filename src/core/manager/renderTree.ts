import { RenderItem } from '../renderItem';
import { OrderedLinkedList } from '../struct/orderedLinkedList';
import { LinkedList } from '../struct/linkedList';
import { CompositionManager } from './composition';

// A series of nodes with same zIndex in rendering order
type ZIndexStack = LinkedList<RenderItem>;
// A layer, with a series of zIndex stack in ascending order by zIndex
type LayerStack = OrderedLinkedList<ZIndexStack>;
// A series of layer, ordered in ascending order by layer index
type CompositionStack = OrderedLinkedList<LayerStack>;

export class CompositionContext {
  public readonly compositionStack: CompositionStack = new OrderedLinkedList();
  public readonly rootNode: RenderItem;

  public constructor(root: RenderItem) {
    this.rootNode = root;
  }

  public Build(root: RenderItem, onComposition: (root: RenderItem) => void) {
    const layerIndex = root.composition ? root.GlobalLayer : root.layer;
    const pendingLayers: RenderItem[] = [];

    // @ts-ignore
    root.Traverse((node: RenderItem) => {
      if (node.GlobalLayer !== layerIndex) {
        pendingLayers.push(node);
        return true;
      }

      node.$Freeze();
      this.AddNode(node as RenderItem, layerIndex);

      if (node !== root && node.composition) {
        onComposition(node);
        return true;
      }
    });

    for (const node of pendingLayers) {
      this.Build(node, onComposition);
    }
  }

  private AddNode(value: RenderItem, layerIndex: number) {
    let layer = this.compositionStack.GetByKey(layerIndex);
    if (layer == null) {
      layer = new OrderedLinkedList<LinkedList<RenderItem>>();
      this.compositionStack.Insert(layer, layerIndex);
    }

    let zIndex = value.GlobalZIndex;
    let stack = layer.GetByKey(zIndex);
    if (stack == null) {
      stack = new LinkedList<RenderItem>();
      layer.Insert(stack, zIndex);
    }

    stack.Push(value);
  }
}

export const RenderTreeManager = new (class RenderTreeManager {
  public readonly renderContexts: Map<
    number /** Node id */,
    CompositionContext
  > = new Map();

  public Build(root: RenderItem) {
    this.renderContexts.clear();

    const rootContext = new CompositionContext(root);
    this.renderContexts.set(0, rootContext);

    const onComposition = (rootNode: RenderItem) => {
      const ctx = this.CreateComposition(rootNode);
      ctx.Build(rootNode, onComposition);
    };

    rootContext.Build(root, onComposition);
  }

  private CreateComposition(rootNode: RenderItem): CompositionContext {
    const nodeId = rootNode.id;
    CompositionManager.CreateComposition(rootNode);

    const ctx = new CompositionContext(rootNode);
    this.renderContexts.set(nodeId, ctx);
    return ctx;
  }
})();

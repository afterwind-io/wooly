import { SystemSignal } from './systemSignal';
import { LinkedList } from './struct/linkedList';
import { getUID } from '../util/idgen';

/**
 * The flag indicates the lifecycle of the node.
 *
 * @export
 * @enum {number}
 */
export const enum NodeState {
  /**
   * Node is instantiated but not inserted into the tree,
   */
  Created,

  /**
   * Node has been inserted into the tree.
   */
  Ready,

  /**
   * Node is in the queue waiting to be destroyed.
   */
  Destroying,

  /**
   * Node has been removed from the tree.
   */
  Destroyed,
}

/**
 * Base class for the node tree structure.
 *
 * @export
 * @abstract
 * @class Node
 */
export abstract class Node {
  /**
   * The unique id.
   *
   * @type {number}
   * @memberof Entity
   */
  public id: number;

  /**
   * A flag indicates whether to enable the entity or not.
   *
   * When set to `false`, the entity is completely ignored. Both `_Update` and
   * `_Draw` are skipped.
   *
   * @type {boolean}
   * @memberof Node
   */
  public enabled: boolean = true;

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * The pointer to the parent node.
   *
   * @protected
   * @type {(Node | null)}
   * @memberof Node
   */
  protected parent: Node | null = null;

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * The pointer to the next sibling node.
   *
   * @protected
   * @type {(Node | null)}
   * @memberof Node
   */
  protected sibling: Node | null = null;

  /**
   * A flag indicates the inner state of the node.
   *
   * Currently it is only for **internal** purpose.
   *
   * @protected
   * @type {NodeState}
   * @memberof Node
   */
  protected state: NodeState = NodeState.Created;

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * The child nodes.
   *
   * @abstract
   * @type {Node[]}
   * @memberof Node
   */
  protected children: Node[] = [];

  public constructor() {
    this.id = getUID();
  }

  /**
   * [**Internal**]
   *
   * The pointer to the first child node.
   *
   * @readonly
   * @protected
   * @type {(Node | null)}
   * @memberof Node
   */
  protected get Child(): Node | null {
    return this.children[0] || null;
  }

  /**
   * A flag indicates whether the node has been destroyed.
   *
   * @protected
   * @type {boolean}
   * @memberof Node
   */
  protected get IsDestroyed(): boolean {
    return (
      this.state === NodeState.Destroying || this.state === NodeState.Destroyed
    );
  }

  /**
   * [**Internal**]
   * **Do not call this manually**
   *
   * Trigger the self-destroy process.
   *
   * @protected
   * @memberof Node
   */
  public $Destroy() {
    this.Traverse((node) => {
      if (node.state === NodeState.Destroyed) {
        return;
      }

      node._Destroy();

      node.$SelfDestroy();

      if (node.parent) {
        node.parent.RemoveChild(node);
      }

      node.state = NodeState.Destroyed;
    });
  }

  /**
   * [**Internal**]
   * **Do not call this manually**
   *
   * Trigger the `_Ready` lifecycle.
   *
   * @internal
   * @returns
   * @memberof Node
   */
  public $Ready() {
    if (this.state === NodeState.Ready) {
      return;
    }

    this.state = NodeState.Ready;
    this._Ready();

    for (const child of this.children) {
      child.$Ready();
    }
  }

  /**
   * Add a child node to the tree. Usually You may call this method during
   * lifecycle events such as `_Ready` and `_Update`, or other callbacks.
   *
   * **NOTE**
   * Do not call this method in the constructor, otherwise it may cause
   * unforeseen problems during initialization.
   *
   * ```typescript
   * class MyGameEntity extends Entity {
   *   public constructor() {
   *     // Nope, just don't do that.
   *     this.AddChild(new OtherEntity());
   *   }
   *
   *   public _Ready() {
   *     // Do it here.
   *     this.AddChild(new OtherEntity());
   *   }
   * }
   * ```
   *
   * @param {Node} item The child.
   * @memberof Node
   */
  public AddChild(item: Node) {
    item.parent = this;

    const lastChild = this.children[this.children.length - 1];
    if (lastChild) {
      lastChild.sibling = item;
    }

    this.children.push(item);

    if (this.state === NodeState.Ready) {
      item.$Ready();
    }
  }

  /**
   * Remove self and its descendants from the Node Tree.
   *
   * Note that the node will not be removed immediately.
   * The deletion request will be queued, and the actual
   * removal will not happen until the whole `Update` cycle ends,
   * and proceeds right before the `Draw` cycle starts.
   *
   * While the deletion is in queue, the value of the `state` property
   * turns `NodeState.Destroying`, then turns `NodeState.Destroyed`
   * after being removed. You can check this property to prevent potential
   * null pointer errors.
   *
   * @memberof Node
   */
  public Free() {
    if (this.IsDestroyed) {
      return;
    }

    this.state = NodeState.Destroying;

    SystemSignal.Emit('OnTreeUpdate', this, 'delete');
  }

  public GetTreeHeight(): number {
    if (this.children.length === 0) {
      return 1;
    }

    let height = 0;
    for (const child of this.children) {
      const h = child.GetTreeHeight();
      if (h > height) {
        height = h;
      }
    }
    return height + 1;
  }

  /**
   * Set the value of `enabled` property.
   *
   * @param {boolean} f The flag.
   * @returns {this} This instance of the entity.
   * @memberof Node
   */
  public SetEnabled(f: boolean): this {
    return (this.enabled = f), this;
  }

  /**
   * Traverse the tree, starts with current node, and then its descendants,
   * in a depth-first manner.
   *
   * This method is meant for **internal** use. If you somehow need this, please
   * avoid manipulating the tree directly during the process.
   *
   * @param {((node: Node) => void | boolean)} cb The traverse handler.
   * @memberof Node
   */
  public Traverse(cb: (node: Node) => void | boolean) {
    let path = new LinkedList<Node>();
    let next: Node = this;

    while (true) {
      if (next == null) {
        throw new Error(
          '[wooly] A null pointer error occurs during the node traverse' +
            ' and it should not happen.'
        );
      }

      const skip = cb(next);

      if (path.Peek() === next) {
        path.Pop();
      } else if (!skip && next.Child) {
        path.Push(next);
        next = next.Child;
        continue;
      }

      while (true) {
        if (next === this) {
          return;
        }

        if (next.sibling != null) {
          next = next.sibling;
          break;
        }

        next = next.parent!;
      }
    }
  }

  /**
   * [**Lifecycle**]
   * Called once before node removed from the tree.
   *
   * @protected
   * @memberof Node
   */
  protected _Destroy() {}

  /**
   * [**Lifecycle**]
   * Called once right after node added to the tree.
   *
   * @protected
   * @memberof Node
   */
  protected _Ready() {}

  /**
   * [**Internal**]
   * **Do not call this manually**
   *
   * A destroy events hook for derived class to do their own house keeping.
   *
   * @protected
   * @memberof Node
   */
  protected $SelfDestroy() {}

  /**
   * Remove the specific child from the tree.
   *
   * @param {Node} item The poor child.
   * @memberof Node
   */
  private RemoveChild(item: Node) {
    const index = this.children.findIndex((c) => c === item);
    if (index === -1) {
      return;
    }
    this.children.splice(index, 1);

    const nextSibling = item.sibling;
    const lastSibling = this.children[index - 1];
    if (lastSibling) {
      lastSibling.sibling = nextSibling;
    }

    /**
     * 理论上这里应该清除`parent`和`sibling`引用，但是这会导致链表遍历时
     * 引用被破坏。既然不清除也不会导致无法gc，于是么...
     */
    // item.parent = null;
    // item.sibling = null;
  }
}

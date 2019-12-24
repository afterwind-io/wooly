import { LinkedList } from "./linkedList";
import { LinkedNode } from "./linkedNode";
import { Nullable } from "../../util/common";

function comparator(targetKey: number, insertKey: number): boolean {
  return targetKey >= insertKey;
}

export class OrderedLinkedList<V> extends LinkedList<V, number> {
  public Insert(value: V, key: number) {
    if (this.GetLength() === 0) {
      return this.Push(value, key);
    }

    const anchor = this.GetInsertAnchor(key);
    if (anchor === this.Tail) {
      return this.Push(value, key);
    }

    const node = new LinkedNode(value, key);

    if (anchor == null) {
      node.next = this.head;
      this.head.prev = node;

      this.head = node;
    } else {
      const nextNode = anchor.next!;

      anchor.next = node;
      node.prev = anchor;

      node.next = nextNode;
      nextNode.prev = node;
    }
  }

  private GetInsertAnchor(key: number): Nullable<LinkedNode<V, number>> {
    let node: Nullable<LinkedNode<V, number>> = this.head;
    while (node != null && !node.IsEmpty()) {
      const nkey = node.key;
      if (nkey == null) {
        throw new Error();
      }

      if (comparator(nkey, key)) {
        return node.prev;
      } else {
        node = node.next;
      }
    }

    return this.Tail;
  }
}

import { LinkedNode } from "./linkedNode";

export class LinkedList<T> {
  private head: LinkedNode<T> | null = null;
  private tail: LinkedNode<T> | null = null;

  public Peek(): T | null {
    return this.InnerPop(false);
  }

  public Pop(): T | null {
    return this.InnerPop();
  }

  public Push(value: T) {
    const node = new LinkedNode(value);

    if (this.head == null) {
      this.head = node;
    }

    if (this.tail == null) {
      this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
  }

  public Traverse(cb: (value: T) => void) {
    let node = this.head;
    while (node != null) {
      cb(node.value!);
      node = node.next;
    }
  }

  private InnerPop(removeTail: boolean = true): T | null {
    const tail = this.tail;

    if (tail == null) {
      return null;
    }

    if (removeTail) {
      const prev = tail.prev;

      if (prev != null) {
        prev.next = null;
      } else {
        this.head = null;
      }

      this.tail = prev;
    }

    return tail.value;
  }
}

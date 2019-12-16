import { LinkedNode } from "./linkedNode";

export class CachedList<T> {
  private head: LinkedNode<T> = new LinkedNode<T>();
  private tail: LinkedNode<T> = this.head;

  public Clear(hard: boolean = false) {
    this.head.value = null as any;
    this.tail = this.head;

    if (!hard) {
      return;
    }

    let node = this.head.next;
    while (node) {
      node.value = null;
      node = node.next;
    }
  }

  public Push(value: T) {
    if (this.head.value == null) {
      this.head.value = value;
      return;
    }

    let node = this.tail.next;
    if (node != null) {
      node.value = value;
    } else {
      node = new LinkedNode<T>(value);
      this.tail.next = node;
    }

    this.tail = node;
  }

  public Traverse(cb: (value: T) => void) {
    let node: LinkedNode<T> | null = this.head;
    while (node != null && node.value != null) {
      cb(node.value);
      node = node.next;
    }
  }
}

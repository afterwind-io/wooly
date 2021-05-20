import { LinkedNode } from './linkedNode';
import { Nullable } from '../../util/common';

export class LinkedList<V, K = null> {
  protected head: LinkedNode<V, K> = new LinkedNode<V, K>();
  protected cursor: LinkedNode<V, K> = this.head;

  public get Head(): LinkedNode<V, K> {
    return this.head;
  }

  public get Tail(): Nullable<LinkedNode<V, K>> {
    return this.cursor.prev;
  }

  public Clear() {
    this.cursor = this.head;

    let node: Nullable<LinkedNode<V, K>> = this.head;
    while (node != null) {
      node.Clear();
      node = node.next;
    }
  }

  public GetByKey(key: K): V | null {
    let value: V | null = null;

    this.Traverse((v, k) => {
      if (k === key) {
        value = v;
        return false;
      }
    });

    return value;
  }

  public GetLength(): number {
    return this.InnerGetLength();
  }

  public GetRawLength(): number {
    return this.InnerGetLength(true);
  }

  public Has(key: K): boolean {
    let flag = false;

    this.Traverse((_, k) => {
      if (k === key) {
        flag = true;
        return false;
      }
    });

    return flag;
  }

  public Peek(): Nullable<V> {
    return this.InnerPop(false);
  }

  public Pop(): Nullable<V> {
    return this.InnerPop();
  }

  public Push(value: V, key: Nullable<K> = null) {
    const tail = this.cursor;
    tail.value = value;
    tail.key = key;

    if (this.cursor.next == null) {
      this.cursor = new LinkedNode();
      tail.next = this.cursor;
      this.cursor.prev = tail;
    } else {
      this.cursor = this.cursor.next;
    }
  }

  public Remove(value: V) {
    let node: Nullable<LinkedNode<V, K>> = null;
    let cursor: Nullable<LinkedNode<V, K>> = this.head;
    while (cursor != null && !cursor.IsEmpty()) {
      if (cursor.value === value) {
        node = cursor;
        break;
      }

      cursor = cursor.next;
    }

    if (node == null) {
      return;
    }

    const prev = node.prev;
    const next = node.next;
    if (prev != null) {
      prev.next = next;
    }
    if (next != null) {
      next.prev = prev;
    }
  }

  public Traverse(cb: (value: V, key: Nullable<K>) => boolean | void) {
    let node: Nullable<LinkedNode<V, K>> = this.head;
    while (node != null && !node.IsEmpty()) {
      const next = cb(node.value!, node.key);
      if (next === false) {
        break;
      }

      node = node.next;
    }
  }

  private InnerGetLength(isContainsEmpty: boolean = false): number {
    let len = 0;
    let node: Nullable<LinkedNode<V, K>> = this.head;
    while (node != null) {
      if (!isContainsEmpty && node.IsEmpty()) {
        break;
      }

      len++;

      node = node.next;
    }

    return len;
  }

  private InnerPop(clearTail: boolean = true): Nullable<V> {
    const tail = this.Tail;

    if (tail == null) {
      return null;
    }

    const value = tail.value;

    if (clearTail) {
      tail.Clear();
      this.cursor = tail;
    }

    return value;
  }
}

export class LinkedNode<V> {
  public value: V | null;
  public next: LinkedNode<V> | null = null;
  public prev: LinkedNode<V> | null = null;

  public constructor(value: V | null = null) {
    this.value = value;
  }
}

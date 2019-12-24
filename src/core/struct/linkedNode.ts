export class LinkedNode<V, K = null> {
  public key: K | null;
  public value: V | null;
  public next: LinkedNode<V, K> | null = null;
  public prev: LinkedNode<V, K> | null = null;

  public constructor(value: V | null = null, key: K | null = null) {
    this.value = value;
    this.key = key;
  }

  public Clear() {
    this.value = null;
    this.key = null;
  }

  public IsEmpty(): boolean {
    return this.value == null && this.key == null;
  }
}

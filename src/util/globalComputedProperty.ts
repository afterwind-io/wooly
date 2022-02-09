import { Node } from "../core/node";

/**
 * 全局计算属性
 *
 * 该类属性具备以下特性：
 * - 有一个可读写的本地值
 * - 有一个只读的全局值，需要根据父节点的全局值及本地值做计算得出
 *
 * 该抽象模型包含了一个本地变量，一个全局值缓存变量，以及一个是否应该更新全局缓存的标记位。
 */
export abstract class GlobalComputedProperty<H extends Node, T> {
  protected host: H;

  private _local: T;
  private _cachedGlobal: T;
  private _isDirty: boolean = true;

  public constructor(host: H, initValue: T) {
    this.host = host;
    this._local = initValue;
    this._cachedGlobal = initValue;
  }

  public get local(): T {
    return this._local;
  }

  public set local(v: T) {
    if (v === this._local) {
      return;
    }

    this._local = v;
    this.Notify();
  }

  public get global(): T {
    if (this._isDirty) {
      this._isDirty = false;
      this._cachedGlobal = this.ComputeGlobalValue();
    }

    return this._cachedGlobal;
  }

  public abstract ComputeGlobalValue(): T;

  public abstract GetPropertyInstance(
    node: Node
  ): GlobalComputedProperty<H, T> | null;

  public Notify(): void {
    this.host.Traverse((node) => {
      const ins = this.GetPropertyInstance(node);
      if (!ins) {
        return;
      }

      if (ins._isDirty) {
        return true;
      }

      ins._isDirty = true;
    });
  }

  public Update(): void {
    void this.global;
  }
}

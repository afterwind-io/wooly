/**
 * 全局计算属性
 * 
 * 该类属性具备以下特性：
 * - 有一个可读写的本地值
 * - 有一个只读的全局值，需要根据父节点的全局值及本地值做计算得出
 * 
 * 该抽象模型包含了一个本地变量，一个全局值缓存变量，以及一个是否应该更新全局缓存的标记位。
 */
export abstract class GlobalComputedProperty<T> {
  protected _local: T;
  protected _cachedGlobal: T;
  protected _isDirty: boolean = true;

  public constructor(initValue: T) {
    this._local = initValue;
    this._cachedGlobal = initValue;
  }

  public get local(): T {
    return this._local;
  }

  public set local(v: T) {
    this._local = v;
    this.UpdateGlobalValue();
  }

  public get global(): T {
    if (this._isDirty) {
      this._isDirty = false;
      this._cachedGlobal = this.GetGlobalValue();
    }

    return this._cachedGlobal;
  }

  public abstract GetGlobalValue(): T;
  public abstract UpdateGlobalValue(): void;
}

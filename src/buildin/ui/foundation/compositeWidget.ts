import { EntitySignals } from "../../../core/entity";
import { Constraint } from "../common/constraint";
import { Size } from "../common/types";
import { Widget } from "./widget";

/**
 * 组合容器组件抽象类。
 *
 * 该抽象代表了一类组件，它们：
 * - 只是一系列子组件的组合容器；
 * - 可能会输出不同的子组件组合，但其在任何时刻最多只拥有一个子组件节点；
 * - 不具备期望尺寸，其尺寸等同于其唯一子组件的大小；
 * - 可能拥有自己的状态；
 *
 * 绝大多数的业务组件都应该继承此类。
 */
export abstract class CompositeWidget<
  OPT = {},
  SIG extends EntitySignals = EntitySignals
> extends Widget<OPT, SIG> {
  protected _Layout(constraint: Constraint): Size {
    const child = this.GetFirstChild();
    if (child) {
      const size = child.$Layout(constraint);
      this._intrinsicWidth = size.width;
      this._intrinsicHeight = size.height;
      return size;
    }

    this._intrinsicHeight = 0;
    this._intrinsicWidth = 0;
    return { width: 0, height: 0 };
  }

  protected abstract _Render(): Widget | null;
}

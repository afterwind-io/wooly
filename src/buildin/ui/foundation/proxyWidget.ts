import { Constraint } from "../common/constraint";
import { Size } from "../common/types";
import { WidgetElement } from "./types";
import { Widget } from "./widget";

interface ProxyWidgetOptions {
  child: Widget | null;
}

/**
 * 代理组件抽象类。
 *
 * 该抽象代表了一类组件，它们不参与任何布局，只负责透传约束及渲染选项提供的唯一子节点。
 */
export abstract class ProxyWidget<
  OPT extends ProxyWidgetOptions = ProxyWidgetOptions,
  SIG = {}
> extends Widget<OPT, SIG> {
  protected _Layout(constraint: Constraint): Size {
    const child = this.GetFirstChild();
    if (!child) {
      return { width: 0, height: 0 };
    }

    return child.$Layout(constraint);
  }

  protected _Render(): WidgetElement {
    return this.options.child;
  }
}

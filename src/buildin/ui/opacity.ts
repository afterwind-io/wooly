import { ProxyWidget } from "./foundation/proxyWidget";
import { WidgetElement } from "./foundation/types";
import { Widget } from "./foundation/widget";

interface OpacityOptions {
  opacity: number;
  child: Widget;
}

export class Opacity extends ProxyWidget<OpacityOptions> {
  public readonly name: string = "Opacity";

  protected _Render(): WidgetElement {
    this.opacity = this.options.opacity;

    return this.options.child;
  }
}

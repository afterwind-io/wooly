import { CompositeWidget } from "./foundation/compositeWidget";
import { Widget } from "./foundation/widget";

interface OpacityOptions {
  opacity: number;
  child: Widget;
}

export class Opacity extends CompositeWidget<OpacityOptions> {
  public readonly name: string = "Opacity";

  protected _Render(): Widget | null {
    this.opacity = this.options.opacity;

    return this.options.child;
  }
}

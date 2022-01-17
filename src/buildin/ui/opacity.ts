import { Length } from "./common/types";
import { SingleChildWidget } from "./foundation/singleChildWidget";
import {
  CommonWidgetOptions,
  SingleChildWidgetOptions,
  WidgetElement,
} from "./foundation/types";

interface OpacityOptions extends CommonWidgetOptions, SingleChildWidgetOptions {
  opacity: number;
}

export class Opacity extends SingleChildWidget<OpacityOptions> {
  public readonly name: string = "Opacity";

  protected readonly isLooseBox: boolean = false;

  public constructor(options: OpacityOptions) {
    super(options);
  }

  protected GetHeight(): Length {
    return "shrink";
  }

  protected GetWidth(): Length {
    return "shrink";
  }

  protected _Render(): WidgetElement {
    this.opacity = this.options.opacity;

    return this.options.child;
  }
}

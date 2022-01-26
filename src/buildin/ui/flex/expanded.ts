import { Length } from "../common/types";
import { SingleChildWidget } from "../foundation/singleChildWidget";
import { SingleChildWidgetOptions, WidgetElement } from "../foundation/types";
import { Widget } from "../foundation/widget";

type BaseOptions = SingleChildWidgetOptions;

export interface ExpandedOptions extends BaseOptions {
  flex?: number;
}

export class Expanded extends SingleChildWidget<ExpandedOptions> {
  public readonly name: string = "Expanded";

  protected readonly isLooseBox: boolean = true;

  protected _Render(): WidgetElement {
    return this.options.child;
  }

  protected GetHeight(): Length {
    return "stretch";
  }

  protected GetWidth(): Length {
    return "stretch";
  }

  protected NormalizeOptions(options: ExpandedOptions): ExpandedOptions {
    return {
      flex: 1,
      ...options,
    };
  }
}

export function GetFlexFactor(child: Widget): number {
  if (child instanceof Expanded) {
    return child.options.flex!;
  }

  return 0;
}

import { Length } from "../common/types";
import { SingleChildWidget } from "../foundation/singleChildWidget";
import {
  SingleChildWidgetOptions,
  SizableWidgetOptions,
  WidgetElement,
} from "../foundation/types";
import { Widget } from "../foundation/widget";

type BaseOptions = SingleChildWidgetOptions & SizableWidgetOptions;

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
    return this.options.height!;
  }

  protected GetWidth(): Length {
    return this.options.width!;
  }

  protected NormalizeOptions(options: ExpandedOptions): ExpandedOptions {
    return {
      ...options,
      flex: options.flex ?? 1,
      width: options.width || "stretch",
      height: options.height || "stretch",
    };
  }
}

export function GetFlexFactor(child: Widget): number {
  if (child instanceof Expanded) {
    return child.options.flex!;
  }

  return 0;
}

import { Length } from "../common/types";
import { SingleChildWidget } from "../foundation/singleChildWidget";
import {
  SingleChildWidgetOptions,
  SizableWidgetOptions,
  WidgetRenderables,
} from "../foundation/types";
import { Widget } from "../foundation/widget";

type BaseOptions = SingleChildWidgetOptions & SizableWidgetOptions;

export interface ExpandedOptions extends BaseOptions {
  flex?: number;
}

export class Expanded extends SingleChildWidget<ExpandedOptions> {
  public readonly name: string = "Expanded";

  protected readonly isLooseBox: boolean = true;

  protected _Render(): WidgetRenderables {
    return this.options.child;
  }

  protected GetHeight(): Length {
    return this.options.height || "stretch";
  }

  protected GetWidth(): Length {
    return this.options.width || "stretch";
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

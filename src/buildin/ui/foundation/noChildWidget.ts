import { WidgetRenderables } from "./types";
import { Widget } from "./widget";

export abstract class NoChildWidget<OPT = {}, SIG = {}> extends Widget<
  OPT,
  SIG
> {
  public constructor(options: OPT) {
    super(options);
  }

  protected _Render(): WidgetRenderables {
    return null;
  }
}

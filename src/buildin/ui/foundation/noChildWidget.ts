import { EntitySignals } from "../../../core/entity";
import { WidgetRenderables } from "./types";
import { Widget } from "./widget";

export abstract class NoChildWidget<
  OPT = {},
  SIG extends EntitySignals = EntitySignals
> extends Widget<OPT, SIG> {
  public constructor(options: OPT) {
    super(options);
  }

  protected _Render(): WidgetRenderables {
    return null;
  }
}

import { EntitySignals } from "../../../core/entity";
import { Nullable } from "../../../util/common";
import { CommonWidgetOptions } from "./types";
import { Widget } from "./widget";

type NoChildWidgetOptions = CommonWidgetOptions;

export abstract class NoChildWidget<
  OPT extends NoChildWidgetOptions = NoChildWidgetOptions,
  SIG extends EntitySignals = EntitySignals
> extends Widget<OPT, SIG> {
  public constructor(options: OPT) {
    super(options);
  }

  protected _Render(): Nullable<Widget> | Nullable<Widget>[] {
    return null;
  }
}

import { Widget } from "./widget";

export abstract class NoChildWidget<OPT = {}, SIG = {}> extends Widget<
  OPT,
  SIG
> {
  protected _Render(): Widget | null {
    return null;
  }
}

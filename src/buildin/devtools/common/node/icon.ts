import { Constraint } from "../../../ui/common/constraint";
import { Size } from "../../../ui/common/types";
import { NoChildWidget } from "../../../ui/foundation/noChildWidget";

export abstract class NodeIconBase extends NoChildWidget {
  public readonly name: string = "NodeIcon";
  public readonly enableDrawing: boolean = true;

  protected _Layout(constraint: Constraint): Size {
    this._intrinsicWidth = 14;
    this._intrinsicHeight = 12;
    return { width: 14, height: 12 };
  }
}

import { CompositeWidget } from "../../ui/foundation/compositeWidget";
import { Widget } from "../../ui/foundation/widget";
import { Node } from "../../../core/node";

interface NodeDetailOptions {
  node: Node;
}

export class NodeDetail extends CompositeWidget<NodeDetailOptions> {
  public readonly name: string = "NodeDetail";

  protected _Render(): Widget | null {
    return null;
  }
}

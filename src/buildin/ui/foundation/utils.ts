import { WidgetRoot } from "../root";
import { Node } from "../../../core/node";

export function isWidgetRoot(node: Node): node is WidgetRoot {
  return !!(node as any).isWidgetRoot;
}

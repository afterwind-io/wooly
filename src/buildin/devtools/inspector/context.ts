import { Node } from "../../../core/node";
import { Blackhole } from "../../../util/common";
import { CreateWidgetContext } from "../../ui/foundation/context";

interface InspectorContext {
  inspectingNode: Node | null;
  onInspect(node: Node): void;
  onPeek(node: Node | null): void;
}

export const InspectorContext = CreateWidgetContext<InspectorContext>(
  {
    inspectingNode: null,
    onInspect: Blackhole,
    onPeek: Blackhole,
  },
  "InspectorContext"
);

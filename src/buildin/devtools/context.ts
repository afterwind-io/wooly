import { Blackhole } from "../../util/common";
import { CreateWidgetContext } from "../ui/foundation/context";
import { Node } from "../../core/node";

interface DevToolsContext {
  inspectingNode: Node | null;
  rootNode: Node;
  rootNodeVersion: number;
  InspectNode(node: Node): void;
  PeekNode(node: Node | null): void;
  PauseGame(): void;
  RestartGame(): void;
}

export const DevToolsContext = CreateWidgetContext<DevToolsContext>(
  {
    inspectingNode: null,
    rootNode: null as any,
    rootNodeVersion: 0,
    InspectNode: Blackhole,
    PeekNode: Blackhole,
    PauseGame: Blackhole,
    RestartGame: Blackhole,
  },
  "InspectorContext"
);

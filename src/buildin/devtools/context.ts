import { Blackhole } from "../../util/common";
import { CreateWidgetContext } from "../ui/foundation/context";
import { Node } from "../../core/node";

interface DevToolsContext {
  inspectingNode: Node | null;
  peekingNode: Node | null;
  /**
   * 是否正在点选屏幕元素的状态
   */
  isPickingNode: boolean;
  isGamePaused: boolean;
  rootNode: Node;
  rootNodeVersion: number;
  InspectNode(node: Node | null): void;
  PeekNode(node: Node | null): void;
  PickNode(flag: boolean): void;
  PauseGame(): void;
  RestartGame(): void;
}

export const DevToolsContext = CreateWidgetContext<DevToolsContext>(
  {
    inspectingNode: null,
    peekingNode: null,
    isPickingNode: false,
    isGamePaused: false,
    rootNode: null as any,
    rootNodeVersion: 0,
    InspectNode: Blackhole,
    PeekNode: Blackhole,
    PickNode: Blackhole,
    PauseGame: Blackhole,
    RestartGame: Blackhole,
  },
  "InspectorContext"
);

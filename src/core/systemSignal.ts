import { Node } from "./node";
import { Signal } from "./signal";

interface SystemSignals {
  OnTreeUpdate: (node: Node, type: "insert" | "delete") => void;
}

export const SystemSignal = new Signal<SystemSignals>();

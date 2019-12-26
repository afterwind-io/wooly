import { Node } from "./node";
import { Signal } from "./signal";

export interface SystemSignals {
  OnLoopEnd: () => void;
  OnLoopStart: () => void;
  OnTreeUpdate: (node: Node, type: "insert" | "delete") => void;
}

export const SystemSignal = new Signal<SystemSignals>();

import { Node } from "./node";
import { Signal } from "./signal";

interface GlobalSignals {
  OnTreeUpdate: (node: Node, type: "insert" | "delete") => void;
}

export const GlobalEvents = new Signal<GlobalSignals>();

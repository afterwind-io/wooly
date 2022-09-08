import { CanvasComposition } from "../../../../core/canvasComposition";
import { CanvasLayer } from "../../../../core/canvasLayer";
import { Widget } from "../../../ui/foundation/widget";
import { WidgetRoot } from "../../../ui/root";
import { NodeIconCanvasComposition } from "./canvasComposition";
import { NodeIconCanvasLayer } from "./canvasLayer";
import { NodeIconEntity } from "./entity";
import { NodeIconWidget } from "./widget";
import { NodeIconWidgetRoot } from "./widgetRoot";
import { Node } from "../../../../core/node";

export function NodeIcon(node: Node): Widget {
  if (node instanceof WidgetRoot) {
    return new NodeIconWidgetRoot({});
  }

  if (node instanceof Widget) {
    return new NodeIconWidget({});
  }

  if (node instanceof CanvasLayer) {
    return new NodeIconCanvasLayer({});
  }

  if (node instanceof CanvasComposition) {
    return new NodeIconCanvasComposition({});
  }

  return new NodeIconEntity({});
}

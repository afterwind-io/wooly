import { Widget } from "../../../ui/foundation/widget";
import { Node } from "../../../../core/node";
import { WidgetRoot } from "../../../ui/root";
import { CanvasLayer } from "../../../../core/canvasLayer";
import { CanvasComposition } from "../../../../core/canvasComposition";
import { NodeDetailCanvasComposition } from "./canvasComposition";
import { NodeDetailEntity } from "./entity";
import { NodeDetailWidget } from "./widget";
import { NodeDetailWidgetRoot } from "./widgetRoot";
import { NodeDetailCanvasLayer } from "./canvasLayer";
import { Entity } from "../../../../core/entity";

export function NodeDetail(node: Node): Widget {
  if (node instanceof WidgetRoot) {
    return new NodeDetailWidgetRoot({ node });
  }

  if (node instanceof Widget) {
    return new NodeDetailWidget({ node });
  }

  if (node instanceof CanvasLayer) {
    return new NodeDetailCanvasLayer({ node });
  }

  if (node instanceof CanvasComposition) {
    return new NodeDetailCanvasComposition({ node });
  }

  return new NodeDetailEntity({ node: node as Entity });
}

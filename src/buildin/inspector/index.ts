import { InspectorMouseIndicator } from "./mouseIndicator";
import { CanvasLayer } from "../../core/canvasLayer";
import { Entity } from "../../core/entity";
import { WidgetRoot } from "../ui/root";
import { Flex, FlexDirection } from "../ui/flex";
import { InspectorFPS } from "./fps";
import { InspectorCounter } from "./counter";
import { Container } from "../ui/container";
import { Edge } from "../ui/common/edge";

/**
 * A utility to provide some insights of the engine.
 *
 * Including:
 * - FPS meter
 * - Entity counter
 * - Mouse indicator
 *
 * @export
 * @class Inspector
 * @extends {Entity}
 */
export class Inspector extends Entity {
  public readonly name: string = "Inspector";

  public _Ready() {
    // 既然调试图层必须始终置顶，何不来个`Infinity`?
    const layer = new CanvasLayer(Infinity);
    this.AddChild(layer);

    layer.AddChild(
      new WidgetRoot({
        child: new Container({
          padding: Edge.All(8),
          child: new Flex({
            direction: FlexDirection.Vertical,
            children: [
              new InspectorMouseIndicator(),
              new InspectorFPS(),
              new InspectorCounter(),
            ],
          }),
        }),
      })
    );
  }
}

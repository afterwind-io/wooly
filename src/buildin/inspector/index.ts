import { InspectorMouseIndicator } from "./mouseIndicator";
import { CanvasLayer } from "../../core/canvasLayer";
import { Entity } from "../../core/entity";
import { WidgetRoot } from "../ui/root";
import { Flex, FlexDirection } from "../ui/flex";
import { InspectorFPS } from "./fps";
import { InspectorCounter } from "./counter";
import { Container } from "../ui/container";
import { Edge } from "../ui/common/edge";
import { SingleChildWidget } from "../ui/foundation/singleChildWidget";
import { UIAction, Widget } from "../ui/foundation/widget";

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
        child: new InspectorApp(),
      })
    );
  }
}

const enum FunctionSet {
  FPS = "FPS",
  MouseIndicator = "MouseIndicator",
  Counter = "Counter",
}

class InspectorApp extends SingleChildWidget {
  public name: string = "InspectorAp2p";

  protected isLooseBox: boolean = false;

  private functionSet: Record<FunctionSet, boolean> = {
    FPS: true,
    MouseIndicator: true,
    Counter: true,
  };

  @UIAction
  private OnFunctionToggle(type: FunctionSet): void {
    this.functionSet[type] = !this.functionSet[type];
  }

  protected _Render(): Widget | Widget[] | null {
    return new Container({
      padding: Edge.All(8),
      child: new Flex({
        direction: FlexDirection.Vertical,
        children: [
          new InspectorMouseIndicator(),
          new InspectorFPS(),
          new InspectorCounter(),
        ],
      }),
    });
  }
}

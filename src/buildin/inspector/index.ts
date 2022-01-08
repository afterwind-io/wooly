import { InspectorMouseIndicator } from "./mouseIndicator";
import { CanvasLayer } from "../../core/canvasLayer";
import { Entity } from "../../core/entity";
import { WidgetRoot } from "../ui/root";
import { Column } from "../ui/flex/flex";
import { InspectorFPS } from "./fps";
import { InspectorCounter } from "./counter";
import { Container } from "../ui/container";
import { Edge } from "../ui/common/edge";
import { SingleChildWidget } from "../ui/foundation/singleChildWidget";
import { Widget } from "../ui/foundation/widget";
import { Length } from "../ui/common/types";
import { Reactive } from "../ui/foundation/decorator";
import { Nullable } from "../../util/common";

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
  public readonly name: string = "InspectorAp2p";

  protected isLooseBox: boolean = false;

  public constructor() {
    super({});
  }

  private functionSet: Record<FunctionSet, boolean> = {
    FPS: true,
    MouseIndicator: true,
    Counter: true,
  };

  @Reactive
  private OnFunctionToggle(type: FunctionSet): void {
    this.functionSet[type] = !this.functionSet[type];
  }

  protected _Render(): Nullable<Widget> | Nullable<Widget>[] {
    return Container.Shrink({
      padding: Edge.All(8),
      child: Column.Shrink({
        children: [
          new InspectorMouseIndicator(),
          new InspectorFPS(),
          new InspectorCounter(),
        ],
      }),
    });
  }

  protected GetHeight(): Length {
    return "shrink";
  }

  protected GetWidth(): Length {
    return "shrink";
  }
}

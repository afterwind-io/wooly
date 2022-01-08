import { SingleChildWidget } from "../ui/foundation/singleChildWidget";
import { Container } from "../ui/container";
import { Edge } from "../ui/common/edge";
import { Text } from "../ui/text";
import { Timer } from "../timer";
import { Checkbox } from "../ui/checkbox";
import { Widget } from "../ui/foundation/widget";
import { EntityTreeManager } from "../../core/manager/entityTree";
import { Length } from "../ui/common/types";
import { Column, Row } from "../ui/flex/flex";
import { Reactive } from "../ui/foundation/decorator";
import { Nullable } from "../../util/common";

export class InspectorCounter extends SingleChildWidget {
  public readonly name: string = "InspectorCounter";

  protected readonly isLooseBox: boolean = false;

  private $timer: Timer = new Timer(1, true);

  private isEnabled: boolean = true;
  private entityCount: number = 0;
  private widgetCount: number = 0;

  public constructor() {
    super({});
  }

  public _Ready() {
    this.$timer = new Timer(1, true);
    this.$timer.Connect("OnTimeout", this.RefreshCounter, this);
    this.AddChild(this.$timer);
  }

  protected _Render(): Nullable<Widget> | Nullable<Widget>[] {
    return Container.Shrink({
      margin: Edge.Bottom(4),
      child: Column.Shrink({
        children: [
          Row.Shrink({
            children: [
              Container.Shrink({
                margin: new Edge(0, 4, 0, 4),
                child: new Checkbox({
                  width: 12,
                  height: 12,
                  checked: this.isEnabled,
                  onToggle: this.Toggle,
                }),
              }),
              new Text({
                content: "Counter",
              }),
            ],
          }),

          Container.Shrink({
            margin: new Edge(16, 4, 0, 4),
            child: new Text({
              content: `Entity Count: ${this.entityCount || "-"}`,
            }),
          }),

          Container.Shrink({
            margin: new Edge(16, 4, 0, 4),
            child: new Text({
              content: `Widget Count: ${this.widgetCount || "-"}`,
            }),
          }),
        ],
      }),
    });
  }

  protected GetFirstChild(): Widget | null {
    return this.children[1] as Widget;
  }

  protected GetHeight(): Length {
    return "shrink";
  }

  protected GetWidth(): Length {
    return "shrink";
  }

  @Reactive
  private RefreshCounter(): void {
    // FIXME high performance impact
    let entities = 0;
    let widgets = 0;

    if (this.isEnabled) {
      EntityTreeManager.sceneRoot.Traverse((node) => {
        entities++;
        if (node instanceof Widget) {
          widgets++;
        }
      });
    }

    this.entityCount = entities;
    this.widgetCount = widgets;
  }

  @Reactive
  private Toggle(isEnabled: boolean): void {
    this.isEnabled = isEnabled;
  }
}

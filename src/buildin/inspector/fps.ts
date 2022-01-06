import { SingleChildWidget } from "../ui/foundation/singleChildWidget";
import { Container } from "../ui/container";
import { Edge } from "../ui/common/edge";
import { Text } from "../ui/text";
import { Timer } from "../timer";
import { Flex } from "../ui/flex";
import { Checkbox } from "../ui/checkbox";
import { SystemTimer } from "../../core/systemTimer";
import { UIAction, Widget } from "../ui/foundation/widget";

export class InspectorFPS extends SingleChildWidget {
  public readonly name: string = "InspectorFPS";

  protected readonly isLooseBox: boolean = false;

  private $timer!: Timer;

  private isEnabled: boolean = true;
  private fps: string = "FPS";

  public constructor() {
    super();

    this.Toggle = this.Toggle.bind(this);
  }

  public _Ready() {
    this.$timer = new Timer(1, true);
    this.$timer.Connect("OnTimeout", this.RefreshCounter, this);
    this.AddChild(this.$timer);
  }

  protected _Render(): Widget | Widget[] | null {
    return new Container({
      margin: Edge.Bottom(4),
      child: new Flex({
        children: [
          new Container({
            margin: Edge.Right(4),
            child: new Checkbox({
              width: 12,
              height: 12,
              checked: this.isEnabled,
              onToggle: this.Toggle,
            }),
          }),
          new Text({
            content: this.fps,
          }),
        ],
      }),
    });
  }

  protected GetFirstChild(): Widget | null {
    return this.children[1] as Widget;
  }

  @UIAction
  private RefreshCounter() {
    let content = "-";

    if (this.isEnabled) {
      const delta = SystemTimer.Delta;
      content = `${Math.round(100 / delta) / 100}`;
    }

    this.fps = `FPS: ${content}`;
  }

  @UIAction
  private Toggle(isEnabled: boolean): void {
    this.isEnabled = isEnabled;
  }
}

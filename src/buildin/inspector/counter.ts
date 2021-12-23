import { SingleChildWidget } from '../ui/foundation/singleChildWidget';
import { Container } from '../ui/container';
import { Edge } from '../ui/common/edge';
import { Text } from '../ui/text';
import { Timer } from '../timer';
import { Flex, FlexDirection } from '../ui/flex';
import { Checkbox } from '../ui/checkbox';
import { Widget } from '../ui/foundation/widget';
import { EntityTreeManager } from '../../core/manager/entityTree';

export class InspectorCounter extends SingleChildWidget {
  public readonly name: string = 'InspectorCounter';

  protected readonly isLooseBox: boolean = false;

  private $timer: Timer = new Timer(1, true);

  private $checkbox!: Checkbox;
  private $entityLabel!: Text;
  private $widgetLabel!: Text;

  private _enable: boolean = true;

  public _Ready() {
    this.AddChild(
      new Container({
        margin: Edge.Bottom(4),
        child: new Flex({
          direction: FlexDirection.Vertical,
          children: [
            new Flex({
              children: [
                new Container({
                  margin: new Edge(0, 4, 0, 4),
                  child: (this.$checkbox = new Checkbox({
                    width: 12,
                    height: 12,
                    checked: this._enable,
                  })),
                }),
                new Text({
                  content: 'Counter',
                }),
              ],
            }),

            new Container({
              margin: new Edge(16, 4, 0, 4),
              child: (this.$entityLabel = new Text({
                content: 'Entity Count',
              })),
            }),

            new Container({
              margin: new Edge(16, 4, 0, 4),
              child: (this.$widgetLabel = new Text({
                content: 'Widget Count',
              })),
            }),
          ],
        }),
      })
    );

    this.$checkbox.Connect('OnToggle', (checked) => {
      this._enable = checked;
    });

    this.$timer = new Timer(1, true);
    this.$timer.Connect('OnTimeout', this.Refresh, this);
    this.AddChild(this.$timer);
  }

  private Refresh() {
    // FIXME high performance impact
    let entity = 0;
    let widget = 0;

    if (this._enable) {
      EntityTreeManager.sceneRoot.Traverse((node) => {
        entity++;
        if (node instanceof Widget) {
          widget++;
        }
      });
    }

    this.$entityLabel.SetContent(`Entity Count: ${entity || '-'}`);
    this.$widgetLabel.SetContent(`Widget Count: ${widget || '-'}`);
  }
}

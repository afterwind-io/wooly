import { SingleChildWidget } from '../ui/foundation/singleChildWidget';
import { Container } from '../ui/container';
import { Edge } from '../ui/common/edge';
import { Text } from '../ui/text';
import { Timer } from '../timer';
import { Flex } from '../ui/flex';
import { Checkbox } from '../ui/checkbox';
import { SystemTimer } from '../../core/systemTimer';

export class InspectorFPS extends SingleChildWidget {
  public readonly name: string = 'InspectorFPS';

  protected readonly isLooseBox: boolean = false;

  private $checkbox!: Checkbox;
  private $label!: Text;
  private $timer!: Timer;

  private _enabled: boolean = true;

  public _Ready() {
    this.AddChild(
      new Container({
        margin: Edge.Bottom(4),
        child: new Flex({
          children: [
            new Container({
              margin: Edge.Right(4),
              child: (this.$checkbox = new Checkbox({
                width: 12,
                height: 12,
                checked: this._enabled,
              })),
            }),
            (this.$label = new Text({
              content: 'FPS',
            })),
          ],
        }),
      })
    );

    this.$checkbox.Connect('OnToggle', (checked) => {
      this._enabled = checked;
    });

    this.$timer = new Timer(1, true);
    this.$timer.Connect('OnTimeout', this.Refresh, this);
    this.AddChild(this.$timer);
  }

  private Refresh() {
    let content = '-';

    if (this._enabled) {
      const delta = SystemTimer.Delta;
      content = `${Math.round(100 / delta) / 100}`;
    }

    this.$label.SetContent(`FPS: ${content}`);
  }
}

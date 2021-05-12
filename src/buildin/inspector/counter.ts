import { SingleChildWidget } from '../ui/foundation/singleChildWidget';
import { Container } from '../ui/container';
import { Edge } from '../ui/common/edge';
import { Text } from '../ui/text';
import { Timer } from '../timer';
import { Engine } from '../../core/engine';
import { Flex } from '../ui/flex';
import { Checkbox } from '../ui/checkbox';

export class InspectorCounter extends SingleChildWidget {
  public readonly name: string = 'InspectorCounter';

  protected readonly isLooseBox: boolean = false;

  private $checkbox!: Checkbox;
  private $label!: Text;
  private $timer: Timer = new Timer(1, true);

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
              content: 'Entity Count',
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
      let i = 0;
      Engine.Current.nodeRoot!.Traverse((_) => (i++, void 0));
      content = `${i}`;
    }

    this.$label.SetContent(`Entity Count: ${content}`);
  }
}

import { SingleChildWidget } from '../ui/foundation/singleChildWidget';
import { Input } from '../media/input';
import { Container } from '../ui/container';
import { Edge } from '../ui/common/edge';
import { Flex } from '../ui/flex';
import { Checkbox } from '../ui/checkbox';
import { Text } from '../ui/text';

export class InspectorMouseIndicator extends SingleChildWidget {
  public readonly name: string = 'InspectorMouseIndicator';

  protected isLooseBox: boolean = false;

  private $checkbox!: Checkbox;

  private _enabled: boolean = true;
  private _x: number = 0;
  private _y: number = 0;

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
            new Text({
              content: 'Mouse Indicator',
            }),
          ],
        }),
      })
    );

    this.$checkbox.Connect('OnToggle', (checked) => {
      this._enabled = checked;
    });
  }

  public _DrawWidget(ctx: CanvasRenderingContext2D) {
    if (!this._enabled) {
      return;
    }

    const x = this._x;
    const y = this._y;

    ctx.fillStyle = 'grey';
    ctx.fillRect(x, y - 16, 1, 32);
    ctx.fillRect(x - 16, y, 32, 1);
    ctx.fillText(`${x},${y}`, x + 5, y - 5);
  }

  public _Update(delta: number) {
    super._Update(delta);

    const { x, y } = Input.GetMousePosition();
    this._x = x;
    this._y = y;
  }
}

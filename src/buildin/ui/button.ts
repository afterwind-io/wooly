import { EntitySignals } from '../../core/entity';
import {
  MouseAction,
  MouseMovement,
  CommonWidgetOptions,
} from './foundation/types';
import { Align } from './align';
import { Text } from './text';
import { SingleChildWidget } from './foundation/singleChildWidget';

interface ButtonSignals extends EntitySignals {
  OnClick: () => void;
}

interface ButtonOptions extends CommonWidgetOptions {
  label?: string;
}

export class Button extends SingleChildWidget<ButtonSignals> {
  public readonly name: string = 'Button';

  protected readonly isLooseBox: boolean = false;

  private _label: string;

  public constructor(options: ButtonOptions = {}) {
    super(options);

    const { label = 'button' } = options;
    this._label = label;
  }

  public _Ready() {
    this.AddChild(
      Align.Center({
        width: 'stretch',
        height: 'stretch',
        child: new Text({
          content: this._label,
        }),
      })
    );
  }

  public _DrawWidget(ctx: CanvasRenderingContext2D) {
    if (this.mouseActionState === MouseAction.MouseDown) {
      this._Draw_MouseDown(ctx);
    } else if (this.mouseMovementState === MouseMovement.MouseHover) {
      this._Draw_MouseOver(ctx);
    } else {
      this._Draw_Normal(ctx);
    }

    ctx.fillRect(0, 0, this._intrinsicWidth, this._intrinsicHeight);

    ctx.strokeStyle = 'grey';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, this._intrinsicWidth, this._intrinsicHeight);
  }

  public _Update(delta: number) {
    super._Update(delta);

    this.SwitchCursor();

    if (this.mouseActionState === MouseAction.MouseClick) {
      this.Emit('OnClick');
    }
  }

  protected _Draw_MouseDown(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'lightgrey';
  }

  protected _Draw_MouseOver(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'whitesmoke';
  }

  protected _Draw_Normal(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'white';
  }

  private SwitchCursor() {
    if (this.mouseMovementState === MouseMovement.MouseHover) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }
  }
}

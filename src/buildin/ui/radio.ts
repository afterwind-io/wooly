import { Constraint } from './common/constraint';
import { Size } from './common/types';
import { EntitySignals } from '../../core/entity';
import { Widget } from './foundation/widget';
import {
  MouseMovement,
  MouseAction,
  CommonWidgetOptions,
} from './foundation/types';

interface RadioSignals extends EntitySignals {
  OnToggle: (value: any) => void;
}

interface RadioOptions extends CommonWidgetOptions {
  toggled?: boolean;
  value?: any;
}

export class Radio extends Widget<RadioSignals> {
  public readonly name: string = 'Radio';
  public readonly customDrawing: boolean = true;

  private _toggled: boolean = false;
  private _value: any = null;

  public constructor(options: RadioOptions = {}) {
    super(options);

    const { toggled = false, value = null } = options;
    this._toggled = toggled;
    this._value = value;
  }

  public _Draw(ctx: CanvasRenderingContext2D) {
    if (this.mouseMovementState === MouseMovement.MouseHover) {
      ctx.fillStyle = 'whitesmoke';
    } else {
      ctx.fillStyle = 'white';
    }

    if (this.mouseActionState === MouseAction.MouseDown) {
      ctx.fillStyle = 'lightgrey';
    }

    const width = this._intrinsicWidth;
    const height = this._intrinsicHeight;
    const radius = Math.min(width, height);

    ctx.strokeStyle = 'grey';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(radius / 2, radius / 2, radius / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.stroke();

    if (this._toggled) {
      ctx.fillStyle = 'grey';
      ctx.beginPath();
      ctx.arc(radius / 2, radius / 2, (radius / 2) * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
      ctx.stroke();
    }
  }

  public _Layout(constraint: Constraint): Size {
    const size = constraint.constrainSize(this.width, this.height);
    this._intrinsicWidth = size.width;
    this._intrinsicHeight = size.height;
    return size;
  }

  public _Update(delta: number) {
    super._Update(delta);

    if (this.mouseActionState === MouseAction.MouseClick) {
      if (this._toggled) {
        return;
      }

      this._toggled = true;
      this.Emit('OnToggle', this._value);
    }
  }

  public SetToggled(flag: boolean): this {
    this._toggled = flag;
    return this;
  }

  public SetValue(value: any): this {
    this._value = value;
    return this;
  }
}

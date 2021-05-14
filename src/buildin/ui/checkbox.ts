import { EntitySignals } from '../../core/entity';
import { Constraint } from './common/constraint';
import { Size } from './common/types';
import {
  MouseMovement,
  MouseAction,
  CommonWidgetOptions,
} from './foundation/types';
import { Widget } from './foundation/widget';

interface CheckboxSignals extends EntitySignals {
  OnToggle: (checked: boolean) => void;
}

interface CheckboxOptions extends CommonWidgetOptions {
  checked?: boolean;
}

export class Checkbox extends Widget<CheckboxSignals> {
  public readonly name: string = 'Checkbox';
  public readonly customDrawing: boolean = true;

  private _checked: boolean = false;

  public constructor(options: CheckboxOptions = {}) {
    super(options);

    const { checked = false } = options;
    this._checked = checked;
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

    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'grey';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.closePath();
    ctx.stroke();

    if (this._checked) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, height);
      ctx.moveTo(width, 0);
      ctx.lineTo(0, height);
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
      this._checked = !this._checked;
      this.Emit('OnToggle', this._checked);
    }
  }

  public SetChecked(checked: boolean): this {
    this._checked = checked;
    return this;
  }
}

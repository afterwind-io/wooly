import { Widget } from './foundation/widget';
import { Constraint } from './common/constraint';
import { Entity } from '../../core/entity';
import { SingleChildWidgetOptions } from './foundation/types';

interface WidgetRootOptions extends SingleChildWidgetOptions {}

export class WidgetRoot extends Entity {
  public readonly name: string = 'WidgetRoot';
  public readonly customDrawing: boolean = true;

  public constructor(options: WidgetRootOptions = {}) {
    super();

    const { child } = options;
    if (child) {
      this.AddChild(child);
    }
  }

  public _Layout() {
    const child = this.children[0];
    if (!child) {
      return;
    }

    if (!(child instanceof Widget)) {
      throw new Error(
        '[wooly] The child of the "WidgetRoot" must be an instance of "Widget".'
      );
    }

    child._Layout(new Constraint());
  }

  public _Draw() {
    this._Layout();
  }
}

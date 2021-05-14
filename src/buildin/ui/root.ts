import { Widget } from './foundation/widget';
import { Constraint } from './common/constraint';
import { Engine } from '../../core/engine';

export class WidgetRoot extends Widget {
  public readonly name: string = 'WidgetRoot';
  public readonly customDrawing: boolean = true;

  public _Layout() {
    const { x: width, y: height } = Engine.GetDimension();

    for (const child of this.children) {
      if (!(child instanceof Widget)) {
        throw new Error(
          '[wooly] The child of the "WidgetRoot" must be an instance of "Widget".'
        );
      }

      child._Layout(new Constraint({ maxWidth: width, maxHeight: height }));
    }

    return { width: 0, height: 0 };
  }

  public _Draw() {
    this._Layout();
  }
}

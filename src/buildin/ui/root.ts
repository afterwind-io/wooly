import { Widget } from './foundation/widget';
import { Constraint } from './common/constraint';
import { Entity } from '../../core/entity';
import { SingleChildWidgetOptions } from './foundation/types';
import { Engine } from '../../core/engine';
import { PipeLineTask } from '../../core/pipeline';

interface WidgetRootOptions extends SingleChildWidgetOptions {}

export class WidgetRoot extends Entity {
  public readonly name: string = 'WidgetRoot';

  private _task: PipeLineTask;

  public constructor(options: WidgetRootOptions = {}) {
    super();

    const { child } = options;
    if (child) {
      this.AddChild(child);
    }

    this._task = new TaskWidgetLayout(this);
  }

  public _Ready() {
    Engine.pipeline.Register(this._task);
  }

  public _Destroy() {
    Engine.pipeline.Unregister(this._task);
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
}

class TaskWidgetLayout implements PipeLineTask {
  public readonly priority: number = 301;

  private _root: WidgetRoot;

  public constructor(root: WidgetRoot) {
    this._root = root;
  }

  public Run = () => {
    this._root._Layout();
  };
}

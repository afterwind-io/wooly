import { Widget } from "./foundation/widget";
import { Constraint } from "./common/constraint";
import { Entity } from "../../core/entity";
import { SingleChildWidgetOptions } from "./foundation/types";
import { Engine } from "../../core/engine";
import { PipeLineTask } from "../../core/pipeline";
import { PipelineTaskPriority } from "../../core/task/consts";

interface WidgetRootOptions extends SingleChildWidgetOptions {}

export class WidgetRoot extends Entity {
  public readonly name: string = "WidgetRoot";

  private readonly globalTaskLayout: PipeLineTask = new TaskWidgetLayout(this);
  private readonly globalTaskUpdate: PipeLineTask = new TaskWidgetUpdate(this);

  private readonly updateQueue: Widget[] = [];

  public constructor(options: WidgetRootOptions = {}) {
    super();

    const { child } = options;
    if (child) {
      this.AddChild(child);
      this.updateQueue.push(child);
    }
  }

  public _Ready() {
    Engine.pipeline.Register(this.globalTaskLayout);
    Engine.pipeline.Register(this.globalTaskUpdate);
  }

  public _Destroy() {
    Engine.pipeline.Unregister(this.globalTaskLayout);
    Engine.pipeline.Unregister(this.globalTaskUpdate);
  }

  public Layout() {
    const child = this.children[0];
    if (!child) {
      return;
    }

    if (!(child instanceof Widget)) {
      throw new Error(
        '[wooly] The child of the "WidgetRoot" must be an instance of "Widget".'
      );
    }

    child.$Layout(new Constraint());
  }

  public UpdateWidget() {
    for (const widget of this.updateQueue) {
      widget.ScheduleUpdate();
    }
    this.updateQueue.length = 0;
  }

  public OnWidgetUpdate(node: Widget): void {
    this.updateQueue.push(node);
  }
}

class TaskWidgetLayout implements PipeLineTask {
  public readonly priority: number = PipelineTaskPriority.LayoutWidget;

  public constructor(private root: WidgetRoot) {}

  public Run() {
    this.root.Layout();
  }
}

class TaskWidgetUpdate implements PipeLineTask {
  public readonly priority: number = PipelineTaskPriority.UpdateWidget;

  public constructor(private root: WidgetRoot) {}

  public Run() {
    this.root.UpdateWidget();
  }
}

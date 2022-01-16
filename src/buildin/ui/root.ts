import { Widget } from "./foundation/widget";
import { Entity } from "../../core/entity";
import { Engine } from "../../core/engine";
import { PipeLineTask } from "../../core/pipeline";
import { PipelineTaskPriority } from "../../core/task/consts";

interface WidgetRootOptions {
  child: Widget;
}

export class WidgetRoot extends Entity {
  public readonly name: string = "WidgetRoot";

  private readonly globalTaskLayout: PipeLineTask = new TaskWidgetLayout(this);
  private readonly globalTaskUpdate: PipeLineTask = new TaskWidgetUpdate(this);

  private readonly updateQueue: Widget[] = [];
  private readonly layoutQueue: Widget[] = [];

  public constructor(options: WidgetRootOptions) {
    super();

    const { child } = options;
    this.AddChild(child);

    this.updateQueue.push(child);
    this.layoutQueue.push(child);
  }

  public _Ready() {
    Engine.pipeline.Register(this.globalTaskLayout);
    Engine.pipeline.Register(this.globalTaskUpdate);
  }

  public _Destroy() {
    Engine.pipeline.Unregister(this.globalTaskLayout);
    Engine.pipeline.Unregister(this.globalTaskUpdate);
  }

  public UpdateWidget() {
    for (const widget of this.updateQueue) {
      widget.$Reconcile();
    }
    this.updateQueue.length = 0;
  }

  public UpdateLayout() {
    if (this.layoutQueue.length === 0) {
      return;
    }

    /**
     * 重排冒泡阶段：
     *
     * 对每一个请求元素，检查其上一轮的约束，如果约束为强约束（宽高确定），
     * 则标记当前元素为顶节点，否则一直向上找到第一个强约束元素为止
     */
    const layoutRoots: Widget[] = [];
    for (const widget of this.layoutQueue) {
      const root = widget.FindNearestParent(
        (node) => node._prevConstraint.IsTight
      );
      if (!root) {
        layoutRoots.push(this.Child as Widget);
      } else {
        layoutRoots.push(root);
      }
    }

    /**
     * 重排标记阶段：
     *
     * 对所有找到的顶节点进行遍历，从最浅的节点开始，至最深的节点，
     * 对其自身及其所有子节点标记 `_isLayoutDirty`。
     *
     * 如果有一个顶节点被标记，即该顶节点为其他需要重排的节点的子代，
     * 那么丢弃该节点重排任务。
     */
    layoutRoots.sort((node1, node2) => node1.depth - node2.depth);

    const pendingLayoutRoots: Widget[] = [];
    for (const widget of layoutRoots) {
      if (widget._isLayoutDirty) {
        continue;
      }

      widget.Traverse<Widget>((node) => {
        node._isLayoutDirty = true;
      });
      pendingLayoutRoots.push(widget);
    }

    /**
     * 重排阶段：
     *
     * 对剩余顶节点进行重排，并清除自身与其自节点的 `_isLayoutDirty` 标记
     */
    for (const widget of pendingLayoutRoots) {
      widget.$Layout(widget._prevConstraint);
    }

    this.layoutQueue.length = 0;
  }

  public OnWidgetUpdate(node: Widget): void {
    this.updateQueue.push(node);
    this.layoutQueue.push(node);
  }
}

class TaskWidgetLayout implements PipeLineTask {
  public readonly priority: number = PipelineTaskPriority.LayoutWidget;

  public constructor(private root: WidgetRoot) {}

  public Run() {
    this.root.UpdateLayout();
  }
}

class TaskWidgetUpdate implements PipeLineTask {
  public readonly priority: number = PipelineTaskPriority.UpdateWidget;

  public constructor(private root: WidgetRoot) {}

  public Run() {
    this.root.UpdateWidget();
  }
}

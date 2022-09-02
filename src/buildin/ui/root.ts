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
  public readonly isWidgetRoot: boolean = true;

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
     * 对每一个请求元素，检查其自身或其祖先是否为`Relayout Boundary`。
     * 如有，则标记该元素为relayout的根，后续的relayout将从这个根节点开始。
     */
    const layoutRoots: Widget[] = [];
    for (const widget of this.layoutQueue) {
      const root = widget.FindNearestParent((node) => node.isRelayoutBoundary);
      if (root) {
        layoutRoots.push(root);
      } else {
        layoutRoots.push(this.child as Widget);
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
        if (!(node instanceof Widget)) {
          return true;
        }

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

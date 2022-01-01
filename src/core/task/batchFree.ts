import { PipeLineTask } from "../pipeline";
import { SystemSignal } from "../systemSignal";
import { Node } from "../node";
import { PipelineTaskPriority } from "./consts";

export class TaskBatchFree implements PipeLineTask {
  public readonly priority: number = PipelineTaskPriority.BatchFree;

  private freeQueue: Node[];

  public constructor() {
    this.freeQueue = [];

    SystemSignal.Connect("OnTreeUpdate", this.OnTreeUpdate, this);
  }

  public Run(): void {
    for (const node of this.freeQueue) {
      node.$Destroy();
    }

    this.freeQueue.length = 0;
  }

  private OnTreeUpdate(node: Node, type: "insert" | "delete") {
    if (type === "delete") {
      this.freeQueue.push(node);
    }
  }
}

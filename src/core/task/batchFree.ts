import { PipeLineTask } from '../pipeline';
import { SystemSignal } from '../systemSignal';
import { Node } from '../node';

export class TaskBatchFree implements PipeLineTask {
  public readonly priority: number = 200;

  private freeQueue: Node[];

  public constructor() {
    this.freeQueue = [];

    SystemSignal.Connect('OnTreeUpdate', this.OnTreeUpdate, this);
  }

  public Run = () => {
    for (const node of this.freeQueue) {
      node.$Destroy();
    }

    this.freeQueue.length = 0;
  };

  private OnTreeUpdate(node: Node, type: 'insert' | 'delete') {
    if (type === 'delete') {
      this.freeQueue.push(node);
    }
  }
}

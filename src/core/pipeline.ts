import { OrderedLinkedList } from "./struct/orderedLinkedList";

export interface PipeLineTask<C extends {} = {}> {
  readonly priority: number;
  Run(context: C): void;
}

export class Pipeline<C extends {} = {}> {
  private tasks: OrderedLinkedList<PipeLineTask<C>> = new OrderedLinkedList();

  public Register(task: PipeLineTask<C>) {
    this.tasks.Insert(task, task.priority);
  }

  public Unregister(task: PipeLineTask<C>) {
    this.tasks.Remove(task);
  }

  public Run(context: C) {
    this.tasks.Traverse((task) => {
      task.Run(context);
    });
  }
}

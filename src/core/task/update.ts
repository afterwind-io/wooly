import { PipeLineTask } from "../pipeline";
import { EntityTreeManager } from "../manager/entityTree";
import { PipelineTaskPriority } from "./consts";

export class TaskUpdate implements PipeLineTask {
  public readonly priority: number = PipelineTaskPriority.Update;

  public Run(): void {
    EntityTreeManager.Update();
  }
}

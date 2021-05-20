import { PipeLineTask } from '../pipeline';
import { EntityTreeManager } from '../manager/entityTree';

export class TaskUpdate implements PipeLineTask {
  public readonly priority: number = 100;

  public Run = () => {
    EntityTreeManager.Update();
  };
}

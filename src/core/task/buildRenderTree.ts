import { PipeLineTask } from '../pipeline';
import { RenderTreeManager } from '../manager/renderTree';
import { EntityTreeManager } from '../manager/entityTree';

export class TaskBuildRenderTree implements PipeLineTask {
  public readonly priority: number = 300;

  public Run = () => {
    RenderTreeManager.Build(EntityTreeManager.sceneRoot!);
  };
}

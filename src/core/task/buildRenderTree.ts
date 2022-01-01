import { PipeLineTask } from "../pipeline";
import { RenderTreeManager } from "../manager/renderTree";
import { EntityTreeManager } from "../manager/entityTree";
import { PipelineTaskPriority } from "./consts";

export class TaskBuildRenderTree implements PipeLineTask {
  public readonly priority: number = PipelineTaskPriority.BuildRenderTree;

  public Run(): void {
    RenderTreeManager.Build(EntityTreeManager.sceneRoot!);
  }
}

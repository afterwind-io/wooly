import { PipeLineTask } from "../pipeline";
import { PaintManager } from "../manager/paint";
import { PipelineTaskPriority } from "./consts";

export class TaskPaint implements PipeLineTask {
  public readonly priority: number = PipelineTaskPriority.Paint;

  public Run(): void {
    PaintManager.Paint();
  }
}

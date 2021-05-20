import { PipeLineTask } from '../pipeline';
import { PaintManager } from '../manager/paint';

export class TaskPaint implements PipeLineTask {
  public readonly priority: number = 400;

  public Run = () => {
    PaintManager.Paint();
  };
}

import { Pipeline } from "./pipeline";
import { EntityTreeManager } from "./manager/entityTree";
import { Entity } from "./entity";
import { TaskUpdate } from "./task/update";
import { TaskBatchFree } from "./task/batchFree";
import { TaskBuildRenderTree } from "./task/buildRenderTree";
import { TaskPaint } from "./task/paint";
import { InputManager, TaskInput } from "./manager/input";
import { PaintManager } from "./manager/paint";

export const Engine = new (class Engine {
  public readonly pipeline: Pipeline = new Pipeline();

  public constructor() {
    this.pipeline.Register(new TaskInput());
    this.pipeline.Register(new TaskUpdate());
    this.pipeline.Register(new TaskBatchFree());
    this.pipeline.Register(new TaskBuildRenderTree());
    this.pipeline.Register(new TaskPaint());

    // TODO 有没有更好的衔接方式？
    PaintManager.onPaintNode = InputManager.PickListener;
  }
  public SetRoot(root: Entity) {
    EntityTreeManager.SetRoot(root);
  }

  public Start() {
    EntityTreeManager.Init();

    this.Loop();
  }

  private Loop = () => {
    this.pipeline.Run({});
    requestAnimationFrame(this.Loop);
  };
})();

export type Engine = typeof Engine;

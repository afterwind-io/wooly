import { CanvasComposition } from "../canvasComposition";
import { Entity } from "../entity";
import { SystemTimer } from "../systemTimer";
import { Transform } from "../transform";

export const EntityTreeManager = new (class SceneTreeManager {
  public readonly sceneRoot: CanvasComposition = new CanvasComposition(0);

  public Init() {
    this.sceneRoot.$Ready();
  }

  public SetRoot(root: Entity) {
    this.sceneRoot["Child"]?.Free();
    this.sceneRoot.AddChild(root);
  }

  public Update() {
    const delta = SystemTimer.Tick();

    this.sceneRoot.Traverse<Transform>((node) => {
      if (!(node instanceof Entity)) {
        return false;
      }

      if (!node.enabled || node.paused) {
        return true;
      }

      node._Update(delta);
    });
  }
})();

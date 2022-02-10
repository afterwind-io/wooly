import { CanvasComposition } from "../canvasComposition";
import { Entity } from "../entity";
import { SystemTimer } from "../systemTimer";
import { Tangible } from "../tangible";
import { CanvasManager } from "./canvas";

export const EntityTreeManager = new (class SceneTreeManager {
  public readonly sceneRoot: CanvasComposition = new CanvasComposition(0);

  public Init() {
    this.sceneRoot.SetSize(CanvasManager.Dimension);
    this.sceneRoot.$Ready();
  }

  public SetRoot(root: Entity) {
    this.sceneRoot.child?.Free();
    this.sceneRoot.AddChild(root);
  }

  public Update() {
    const delta = SystemTimer.Tick();

    this.sceneRoot.Traverse<Tangible>((node) => {
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

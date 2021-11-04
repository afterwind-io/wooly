import { Entity } from '../entity';
import { SystemTimer } from '../systemTimer';

export const EntityTreeManager = new (class EntityTreeManager {
  public entityRoot!: Entity;

  public Init() {
    if (!this.entityRoot) {
      throw new Error(
        '[wooly] A root node should be set before start the engine.'
      );
    }

    this.entityRoot.$Ready();
  }

  public SetRoot(root: Entity) {
    if (this.entityRoot) {
      this.entityRoot.Free();
    }

    this.entityRoot = root;
    // @ts-ignore
    window.root = root;
  }

  public Update() {
    this.entityRoot.$Update(SystemTimer.Tick());
  }
})();

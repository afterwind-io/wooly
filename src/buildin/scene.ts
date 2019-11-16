import { Entity, EntitySignals } from "../core/entity";

interface SceneCtor {
  new (): Scene;
}

interface SceneSignals extends EntitySignals {
  OnSwitch: (next: string) => void;
}

/**
 * A helper class to present a game scene.
 *
 * @export
 * @abstract
 * @class Scene
 * @extends {Entity<SceneSignals>}
 */
export abstract class Scene extends Entity<SceneSignals> {
  /**
   * Switch to the scene by specified name.
   *
   * @param {string} next The name of the scene.
   * @memberof Scene
   */
  public SwitchScene(next: string) {
    this.Emit("OnSwitch", next);
  }
}

/**
 * A flag indicates how scene initialized when being switched to.
 *
 * @export
 * @enum {number}
 */
export const enum SceneInitPolicy {
  /**
   * Alawys creates a new instance.
   */
  New,
  /**
   * If the scene has been initialized once, use that last instance.
   *
   * You can use this flag to keep all the state of the scene
   * through the whole lifecycle of the game.
   */
  Persist
}

interface SceneRegistry {
  policy: SceneInitPolicy;
  ctor: SceneCtor;
  instance: Scene | null;
}

/**
 * A helper class to manage scenes
 *
 * @export
 * @class SceneManager
 * @extends {Entity}
 */
export class SceneManager extends Entity {
  public readonly name: string = "SceneManager";

  private registry: Record<string, SceneRegistry> = {};
  private current: string = "";

  /**
   * Register a scene.
   *
   * All registered scene are "lazy", which means
   * they will not be initialized until needed.
   *
   * @param {string} name The name of the scene.
   * @param {SceneCtor} ctor
   * The constructor of the scene, usually the derived class of the scene.
   * @param {SceneInitPolicy} [policy=SceneInitPolicy.New]
   * Indicates how scene being initialized.
   * @returns {this} This instance of the `SceneManager`
   * @memberof SceneManager
   */
  public Register(
    name: string,
    ctor: SceneCtor,
    policy: SceneInitPolicy = SceneInitPolicy.New
  ): this {
    this.registry[name] = {
      policy,
      ctor,
      instance: null
    };
    return this;
  }

  /**
   * Set the initial scene to show
   * when the manager get rendered for the first time.
   *
   * When set, the specified scene will be initialized immediately.
   *
   * @param {string} name The name of the scene.
   * @returns {this} This instance of the `SceneManager`.
   * @memberof SceneManager
   */
  public SetEntry(name: string): this {
    this.InitScene(this.GetSceneRegistry(name));
    this.current = name;

    return this;
  }

  private EnterScene(name: string) {
    const registry = this.GetSceneRegistry(name);
    const { policy, instance } = registry;

    if (!instance) {
      this.InitScene(registry);
    } else if (policy === SceneInitPolicy.Persist) {
      instance.SetEnabled(true);
    }
  }

  private ExitScene(name: string) {
    const registry = this.GetSceneRegistry(name);
    const { policy, instance } = registry;

    if (policy === SceneInitPolicy.New) {
      instance!.Free();
      registry.instance = null;
    } else {
      instance!.SetEnabled(false);
    }
  }

  private GetSceneRegistry(name: string): SceneRegistry {
    const reg = this.registry[name];
    if (!reg) {
      throw new Error(`[wooly] Scene "${name}" not exist.`);
    }

    return reg;
  }

  private InitScene(registry: SceneRegistry) {
    const { ctor } = registry;
    const instance = (registry.instance = new ctor());
    instance.Connect("OnSwitch", this.OnSwitch, this);
    this.AddChild(instance);
  }

  private OnSwitch(name: string) {
    this.ExitScene(this.current);

    this.EnterScene(name);
    this.current = name;
  }
}

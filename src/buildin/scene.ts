import { Entity } from "../core/entity";

interface SceneCtor {
  new (): Scene;
}

interface SceneSignals {
  OnSwitch: (next: string) => void;
  OnPush: (next: string) => void;
  OnPop: () => void;
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
   * Switch to the scene by the specified name.
   *
   * @param {string} next The name of the next scene.
   * @memberof Scene
   */
  public SwitchScene(next: string) {
    this.Emit("OnSwitch", next);
  }

  /**
   * Switch to the scene by the specified name, and push the scene onto stack.
   *
   * You can use `PopScene()` to quickly switch back to the last scene on the stack.
   *
   * @param {string} next The name of the next scene.
   * @memberof Scene
   */
  public PushScene(next: string) {
    this.Emit("OnPush", next);
  }

  /**
   * Leave the current scene and pop it from the stack,
   * then switch to the last scene on the stack, which is pushed by `PushScene()`.
   *
   * @memberof Scene
   */
  public PopScene() {
    this.Emit("OnPop");
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
   * Always creates a new instance.
   */
  New,
  /**
   * If the scene has been initialized once, use that last instance.
   *
   * You can use this flag to keep all the state of the scene
   * through the whole lifecycle of the game.
   */
  Persist,
}

interface SceneRegistry {
  policy: SceneInitPolicy;
  ctor: SceneCtor;
  instance: Scene | null;
}

/**
 * A stack-based helper class to manage scenes
 *
 * @export
 * @class SceneManager
 * @extends {Entity}
 */
export class SceneManager extends Entity {
  public readonly name: string = "SceneManager";

  private registry: Record<string, SceneRegistry> = {};
  private stack: string[] = [];

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
      instance: null,
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
    this.stack = [name];

    return this;
  }

  private EnterScene(name: string) {
    const registry = this.GetSceneRegistry(name);
    const { policy, instance } = registry;

    if (!instance) {
      this.InitScene(registry);
    } else if (policy === SceneInitPolicy.Persist) {
      instance.SetVisible(true);
    }
  }

  private ExitScene(name: string) {
    const registry = this.GetSceneRegistry(name);
    const { policy, instance } = registry;

    if (policy === SceneInitPolicy.New) {
      instance!.Free();
      registry.instance = null;
    } else {
      instance!.SetVisible(false);
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
    instance.Connect("OnSwitch", this.OnSwitchTo, this);
    instance.Connect("OnPush", this.OnPush, this);
    instance.Connect("OnPop", this.OnPop, this);

    this.AddChild(instance);
  }

  private GetCurrentScene(): string {
    const count = this.stack.length;
    if (count === 0) {
      throw new Error("");
    }

    return this.stack[count - 1];
  }

  private OnSwitchTo(name: string) {
    const from = this.GetCurrentScene();
    const to = name;

    this.stack = [to];
    this.OnSwitch(from, to);
  }

  private OnPush(name: string) {
    const from = this.GetCurrentScene();
    const to = name;

    this.stack.push(to);
    this.OnSwitch(from, to);
  }

  private OnPop() {
    const from = this.stack.pop();
    if (!from) {
      throw new Error("[wooly] No more scene on stack.");
    }

    const to = this.GetCurrentScene();
    this.OnSwitch(from, to);
  }

  private OnSwitch(from: string, to: string) {
    this.ExitScene(from);
    this.EnterScene(to);
  }
}

interface StateCtor<T> {
  new (h: T): State<T>;
}

/**
 * The state.
 *
 * @export
 * @abstract
 * @class State
 * @template T The type of the host object.
 */
export abstract class State<T> {
  /**
   * The name of the state.
   *
   * Also acts as the index key in the registry of the state machine.
   *
   * @abstract
   * @type {string}
   * @memberof State
   */
  public abstract readonly name: string;

  /**
   * The reference to the host object.
   *
   * @type {T} The type of the host object.
   * @memberof State
   */
  protected h: T;

  /**
   * Creates an instance of State.
   * @param {T} h The reference to the host object.
   * @memberof State
   */
  public constructor(h: T) {
    this.h = h;
  }

  /**
   * Decide which state is the next.
   *
   * @abstract
   * @returns {(State<T> | string)} The next state.
   * If a string is returned,
   * the state machine will take it as the state name,
   * and fetch the corresponding state from its registry.
   * @memberof State
   */
  public abstract Next(): State<T> | string;

  /**
   * [Lifecycle]
   * Called once only when state get registered.
   *
   * @memberof State
   */
  public Init() {}

  /**
   * [Lifecycle]
   * Called when itself becomes the current state.
   *
   * @memberof State
   */
  public Enter() {}

  /**
   * [Lifecycle]
   * Called when state machine updates if itself is the current state.
   *
   * @memberof State
   */
  public Update() {}

  /**
   * [Lifecycle]
   * Called before shifting to the next state.
   *
   * @memberof State
   */
  public Exit() {}
}

/**
 * A placeholder state.
 *
 * @class EmptyState
 * @extends {State<any>}
 */
class EmptyState extends State<any> {
  public name: string = "duh";

  public Next(): State<any> {
    throw new Error(`[wooly] StateMachine uninitialized.`);
  }
}

/**
 * The state machine.
 *
 * @export
 * @class StateMachine
 * @template T The type of the host object.
 */
export class StateMachine<T> {
  /**
   * The reference to the host object.
   * 
   * A `host` means the target it attached to.
   * 
   * ```typescript
   * // `host` points to the instance of the `Player`
   * class Player extends Entity {
   *   private stateMachine = new StateMachine<Player>(this);
   * }
   * ```
   *
   * @type {T}
   * @memberof StateMachine
   */
  public host: T;

  /**
   * The reference to the last state.
   *
   * @type {(State<T> | null)}
   * @memberof StateMachine
   */
  public previous: State<T> | null = null;

  /**
   * The reference to the current state.
   *
   * @type {State<T>}
   * @memberof StateMachine
   */
  public current: State<T> = new EmptyState(this);

  private registry: Record<string, State<T>> = {};

  /**
   * Creates an instance of StateMachine.
   * @param {T} host The reference to the host object.
   * @memberof StateMachine
   */
  public constructor(host: T) {
    this.host = host;
  }

  /**
   * Get an inner state from the registry by the specified name.
   *
   * @param {string} name The name of a registered state.
   * @returns {State<T>} The result state.
   * @memberof StateMachine
   */
  public GetState(name: string): State<T> {
    const state = this.registry[name];

    if (!state) {
      throw new Error(`[wooly] State "${name}" not exists.`);
    }

    return state;
  }

  /**
   * Forward to the next state.
   *
   * By default, the inner logic of the current state decides what the next state is.
   * However, you can alter the result by providing a state object or a state name,
   * which should be registered beforehand.
   *
   * This method is usually called after the `Update` call.
   * ```typescript
   * public _Update() {
   *   this.stateMachine.Update();
   *   this.stateMachine.Next();
   * }
   * ```
   *
   * @param {State<T> | string} [forceNext] The state object or state name.
   * @memberof StateMachine
   */
  public Next(forceNext?: State<T> | string): void {
    const next = this.GetUniformState(forceNext || this.current.Next());

    if (next == this.current) {
      this.previous = this.current;
      return;
    }

    // #!debug
    console.log(`${this.current.name} -> ${next.name}`);

    this.current.Exit();
    this.previous = this.current;
    this.current = next;
    this.current.Enter();
  }

  /**
   * Register a state object.
   *
   * @param {State<T>} state A instanced state object.
   * @returns {this} The state machine instance.
   * @memberof StateMachine
   */
  public Register(state: State<T>): this;
  /**
   * Register a state.
   * 
   * The state machine will instantiate the state with its host reference.
   * ```typescript
   * class StateA extends State<Player>{}
   * 
   * this.stateMachine.Register(StateA);
   * // StateA.host === this.stateMachine.host
   * ```
   *
   * @param {StateCtor<T>} ctor The constructor of the state.
   * @returns {this} The state machine instance.
   * @memberof StateMachine
   */
  public Register(ctor: StateCtor<T>): this;
  public Register(r: State<T> | StateCtor<T>): this {
    let state: State<T>;
    if (r instanceof State) {
      state = r;
    } else {
      state = new r(this.host);
    }

    this.registry[state.name] = state;
    state.Init();

    return this;
  }

  /**
   * Set the current state by state object or state name.
   *
   * Unlike `Next`, this method directly change the current state of the machine,
   * thus it won't call any lifecycle methods of the state (`Enter`, `Exit`).
   *
   * Call this during the machine initialization only.
   * Otherwise, use it with caution.
   *
   * ```typescript
   * public _Ready() {
   *   this.stateMachine.Register(StateA).Register(StateB).SetCurrent("A");
   * }
   * ```
   *
   * @param {(State<T> | string)} state The state object or state name.
   * @returns {this} The state machine instance.
   * @memberof StateMachine
   */
  public SetCurrent(state: State<T> | string): this {
    return (this.current = this.GetUniformState(state)), this;
  }

  /**
   * Update the current state.
   *
   * In other words, call the `Update` method of the current state.
   *
   * @memberof StateMachine
   */
  public Update() {
    this.current.Update();
  }

  private GetUniformState(s: State<T> | string) {
    return typeof s === "string" ? this.GetState(s) : s;
  }
}

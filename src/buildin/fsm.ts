interface StateCtor<T> {
  new (me: T): State<T>;
}

export abstract class State<T> {
  public me: T;
  public abstract readonly name: string;

  public constructor(me: T) {
    this.me = me;
  }

  public abstract Next(): State<T> | string;

  public Init() {}
  public Enter() {}
  public Update() {}
  public Exit() {}
}

class EmptyState extends State<any> {
  public name: string = "duh";

  public Next(): State<any> {
    throw new Error(`[wooly] StateMachine uninitialized.`);
  }
}

export class StateMachine<T> {
  public host: T;
  public previous: State<T> | null = null;
  public current: State<T> = new EmptyState(this);

  private registry: Record<string, State<T>> = {};

  public constructor(host: T) {
    this.host = host;
  }

  public GetState(name: string): State<T> {
    const state = this.registry[name];

    if (!state) {
      throw new Error(`[wooly] State "${name}" not exists.`);
    }

    return state;
  }

  public Next(next?: State<T>): void;
  public Next(name?: string): void;
  public Next(n?: State<T> | string) {
    const next = this.GetUniformState(n || this.current.Next());

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

  public Register(ctor: StateCtor<T>): this {
    let state = new ctor(this.host);
    this.registry[state.name] = state;
    state.Init();

    return this;
  }

  public SetCurrent(state: State<T>): this;
  public SetCurrent(name: string): this;
  public SetCurrent(s: State<T> | string): this {
    return (this.current = this.GetUniformState(s)), this;
  }

  public Update() {
    if (this.current != null) {
      this.current.Update();
    }
  }

  private GetUniformState(s: State<T> | string) {
    return typeof s === "string" ? this.GetState(s) : s;
  }
}

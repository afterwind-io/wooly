import { CanvasTree } from "./canvasTree";
import { Entity } from "./entity";
import { GlobalEvents } from "./globals";
import { Node } from "./node";
import { Signal } from "./signal";
import { Vector2 } from "../util/vector2";

interface EngineSignals {
  LoopEnd: () => void;
  LoopStart: () => void;
}

export class Engine {
  private static me: Engine;

  public ctx: CanvasRenderingContext2D;
  public nodeRoot: Entity | null = null;
  public canvasRoot: CanvasTree = new CanvasTree();

  private nodeFreeQueue: Node[] = [];

  private lastUpdate: number = performance.now();
  private lastDelta: number = 0;

  private signals: Signal<EngineSignals> = new Signal();

  private constructor(canvas: HTMLCanvasElement, backend: "2d") {
    const ctx = canvas.getContext(backend, { alpha: false });
    if (ctx === null) {
      throw new Error("Cannot get 2d ctx.");
    }
    this.ctx = ctx;

    this.Loop = this.Loop.bind(this);

    GlobalEvents.Connect("OnTreeUpdate", this.OnTreeUpdate, this);
  }

  public static Create(canvas: HTMLCanvasElement, backend: "2d"): Engine {
    if (!Engine.me) {
      Engine.me = new Engine(canvas, backend);
    }

    return Engine.me;
  }

  public static get Current(): Engine {
    return Engine.me;
  }

  /**
   * Get last frame delta time.
   *
   * @static
   * @returns {number} Delta time in `ms`.
   * @memberof Engine
   */
  public static GetDelta(): number {
    return Engine.me.lastDelta;
  }

  /**
   * Get current size of the canvas.
   *
   * @static
   * @returns {Vector2} The size object.
   * @memberof Engine
   */
  public static GetDimension(): Vector2 {
    const canvas = Engine.me.GetHost();
    return new Vector2(canvas.clientWidth, canvas.clientHeight);
  }

  /**
   * Get host canvas instance.
   *
   * @returns {HTMLCanvasElement} The canvas element.
   * @memberof Engine
   */
  public GetHost(): HTMLCanvasElement {
    if (Engine.me == null) {
      throw new Error("Engine uninitialized.");
    }

    return Engine.me.ctx.canvas;
  }

  public OnLoopEnd(cb: () => void) {
    this.signals.Connect("LoopEnd", cb);
  }

  public OnLoopStart(cb: () => void) {
    this.signals.Connect("LoopStart", cb);
  }

  public SetRoot(root: Entity) {
    if (this.nodeRoot) {
      this.nodeRoot.Free();
    }

    this.nodeRoot = root;
  }

  public Run() {
    if (!this.nodeRoot) {
      throw new Error(
        "[wooly] A root node should be set before start the engine."
      );
    }

    this.Loop();
  }

  private BatchFree() {
    for (const node of this.nodeFreeQueue) {
      node.$Destroy();
    }

    this.nodeFreeQueue.length = 0;
  }

  private Draw() {
    const canvas = this.ctx.canvas;
    this.ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    this.canvasRoot.Draw(this.nodeRoot!, this.ctx);
  }

  private Loop() {
    this.signals.Emit("LoopStart");

    this.Update();
    this.BatchFree();
    this.Draw();

    this.signals.Emit("LoopEnd");

    requestAnimationFrame(this.Loop);
  }

  private OnTreeUpdate(node: Node, type: "insert" | "delete") {
    if (type === "delete") {
      this.nodeFreeQueue.push(node);
    }
  }

  private Update() {
    const timestamp = performance.now();
    this.lastDelta = timestamp - this.lastUpdate;

    this.lastUpdate = timestamp;

    this.nodeRoot!.$Update(this.lastDelta);
  }
}

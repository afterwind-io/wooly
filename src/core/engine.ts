import { Entity } from "./entity";
import { Signal } from "./signal";
import { Vector2 } from "../util/vector2";

// TODO: double buffer

let _canvas: HTMLCanvasElement | null;
let _lastUpdate: number = Date.now();
let _lastDelta: number = 0;

export class Engine {
  public ctx: CanvasRenderingContext2D;
  public rootNode: Entity | null = null;

  private signals: Signal = new Signal();

  public constructor(canvas: HTMLCanvasElement, backend: "2d") {
    _canvas = canvas;

    const ctx = canvas.getContext(backend);
    if (ctx === null) {
      throw new Error("Cannot get 2d ctx.");
    }
    this.ctx = ctx;

    this.Run = this.Run.bind(this);
  }

  /**
   * Get last frame delta time.
   *
   * @static
   * @returns {number} Delta time in `ms`.
   * @memberof Engine
   */
  public static GetDelta(): number {
    return _lastDelta;
  }

  /**
   * Get current size of the canvas.
   *
   * @static
   * @returns {Vector2} The size object.
   * @memberof Engine
   */
  public static GetDimension(): Vector2 {
    if (_canvas) {
      return new Vector2(_canvas.clientWidth, _canvas.clientHeight);
    } else {
      throw new Error("Canvas unset.");
    }
  }

  /**
   * Get host canvas instance.
   *
   * @returns {HTMLCanvasElement} The canvas element.
   * @memberof Engine
   */
  public GetHost(): HTMLCanvasElement {
    if (_canvas == null) {
      throw new Error("Canvas unset.");
    }

    return _canvas;
  }

  public OnLoopEnd(cb: () => void) {
    this.signals.Add("loopEnd", cb);
  }

  public OnLoopStart(cb: () => void) {
    this.signals.Add("loopStart", cb);
  }

  public SetScene(scene: Entity) {
    this.rootNode = scene;
  }

  public Run() {
    this.signals.Emit("loopStart");
    this.Loop();
    this.signals.Emit("loopEnd");

    requestAnimationFrame(this.Run);
  }

  private Loop() {
    if (!this.rootNode) {
      throw new Error("No root node!");
    }

    this.ctx.clearRect(0, 0, _canvas!.clientWidth, _canvas!.clientHeight);

    const timestamp = Date.now();
    _lastDelta = timestamp - _lastUpdate;
    _lastUpdate = timestamp;

    this.rootNode.$Tick(this.ctx, _lastDelta);
  }
}

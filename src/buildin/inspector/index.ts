import { MouseIndicator } from "./mouseIndicator";
import { Layer } from "../layer";
import { Timer } from "../timer";
import { Label } from "../ui/label";
import { Engine } from "../../core/engine";
import { Entity } from "../../core/entity";

/**
 * A utility to provide some insights of the engine.
 *
 * Including:
 * - FPS meter
 * - Entity counter
 * - Mouse indicator
 *
 * @export
 * @class Inspector
 * @extends {Entity}
 */
export class Inspector extends Entity {
  /**
   * A flag to display the mouse indicator.
   *
   * @static
   * @type {number}
   * @memberof Inspector
   */
  public static MOUSE_INDICATOR: number = 1 << 0;

  /**
   * A flag to display the FPS meter.
   *
   * @static
   * @type {number}
   * @memberof Inspector
   */
  public static FPS: number = 1 << 1;

  /**
   * A flag to display the Entity counter.
   *
   * @static
   * @type {number}
   * @memberof Inspector
   */
  public static ENTITY_COUNTER: number = 1 << 2;

  public readonly name: string = "Inspector";

  private mode: number = 0;
  private timer: Timer = new Timer(1000, true);

  private labelFPS: Label = new Label();
  private labelEntityCounter = new Label();
  private mouseIndicator = new MouseIndicator();

  public _Ready() {
    this.timer.Connect("OnTimeout", this.Refresh, this);
    this.AddChild(this.timer);

    this.labelFPS.SetPosition(8, 16);
    this.labelEntityCounter.SetPosition(8, 32);

    // 既然调试图层必须始终置顶，何不来个`Infinity`?
    const layer = new Layer(Infinity).SetName("Inspector Layer");
    layer.AddChild(this.labelFPS);
    layer.AddChild(this.labelEntityCounter);
    layer.AddChild(this.mouseIndicator);
    this.AddChild(layer);
  }

  public _Update() {
    if (!(this.mode & Inspector.MOUSE_INDICATOR)) {
      this.mouseIndicator.enabled = false;
    }
  }

  /**
   * Control the utilities displaying flags.
   *
   * You can use bitwise OR operator "`|`" to chain multiple goodies.
   *
   * @example
   * ```typescript
   * this.AddChild(new Inspector().SetMode(
   *   Inspector.FPS | Inspector.ENTITY_COUNTER
   * ))
   * ```
   *
   * @param {number} mode
   * @returns {this} This instance of the `Inspector`.
   * @memberof Inspector
   */
  public SetMode(mode: number): this {
    return (this.mode = mode), this;
  }

  private Refresh() {
    if (this.mode & Inspector.FPS) {
      this.RefreshFPS();
    }

    if (this.mode & Inspector.ENTITY_COUNTER) {
      this.RefreshEntityCounter();
    }
  }

  private RefreshFPS() {
    const delta = Engine.GetDelta();
    const fps = Math.round(100000 / delta) / 100;

    this.labelFPS.SetContent(`FPS: ${fps}`);
  }

  private RefreshEntityCounter() {
    let i = 0;
    Engine.Current.nodeRoot!.Traverse(_ => (i++, void 0));

    this.labelEntityCounter.SetContent(`Total Entities: ${i}`);
  }
}

import { Entity, EntitySignals } from "../core/entity";
import { CoolDown } from "../util/cooldown";

/**
 * Define the behavior when timer reachs 0.
 *
 * @enum {number}
 */
export const enum TimerBehavior {
  /**
   * Timer will stop on timeout.
   */
  Once,
  /**
   * Timer will restart on timeout.
   */
  Repeat
}

interface TimerSignals extends EntitySignals {
  /**
   * Emits when timer reachs 0.
   *
   * @memberof TimerSignals
   */
  OnTimeout: () => void;
}

/**
 * A helper class to present a timer.
 *
 * It is basically a wrapper around a `Cooldown` class.
 *
 * @export
 * @class Timer
 * @extends {Entity<TimerSignals>}
 */
export class Timer extends Entity<TimerSignals> {
  private readonly autoStart: boolean;
  private cd: CoolDown;
  private mode: TimerBehavior;

  /**
   * Creates an instance of Timer.
   *
   * @param {number} interval
   * The interval of the timer, or the timeout before time running out.
   *
   * @param {boolean} [autoStart=true]
   * Indicates whether to start timer immediately on the first update.
   * If set to `false`, the timer will not start
   * until `Start` get called manually.
   *
   * @param {TimerBehavior} [mode=TimerBehavior.Repeat]
   * Indicates the behavior of the timer when timeout.
   *
   * @memberof Timer
   */
  public constructor(
    interval: number,
    autoStart: boolean = true,
    mode: TimerBehavior = TimerBehavior.Repeat
  ) {
    super();

    this.autoStart = autoStart;
    this.cd = new CoolDown(interval);
    this.mode = mode;
  }

  public _Ready() {
    if (this.autoStart) {
      this.cd.Activate();
    } else {
      this.enabled = false;
    }
  }

  public _Update(delta: number) {
    this.cd.Cool(delta);
    if (this.cd.isCooling) {
      return;
    }

    this.Emit("OnTimeout");

    if (this.mode === TimerBehavior.Repeat) {
      this.cd.Activate();
    }
  }

  /**
   * Get the remaining time.
   *
   * @returns {number} Time in `ms`.
   * @memberof Timer
   */
  public GetRemains(): number {
    return this.cd.Remains;
  }

  /**
   * Resume the countdown.
   *
   * @memberof Timer
   */
  public Continue() {
    this.enabled = true;
  }

  /**
   * Start the timer.
   *
   * It will reset its remaining time to the value of its interval.
   *
   * @memberof Timer
   */
  public Start() {
    this.cd.Reset();
    this.cd.Activate();

    this.enabled = true;
  }

  /**
   * Stop the timer.
   *
   * It actually acts like `pause`,
   * thus keeps the time remains and other state unchanged.
   *
   * @memberof Timer
   */
  public Stop() {
    this.enabled = false;
  }
}

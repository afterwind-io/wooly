/**
 * A utility class represents the concept of "CoolDown".
 * 
 * Basically a mini timer for continuous countdown.
 *
 * @export
 * @class CoolDown
 */
export class CoolDown {
  private cd: number = 0;
  private timer: number = 0;

  /**
   * Indicates whether the timer is still counting.
   *
   * @type {boolean}
   * @memberof CoolDown
   */
  public isCooling: boolean = false;

  /**
   * Creates an instance of CoolDown.
   * @param {number} interval The interval of the timer.
   * @memberof CoolDown
   */
  public constructor(interval: number) {
    this.cd = interval;
    this.timer = interval;
  }

  /**
   * Get the remaining time until timeout.
   *
   * @readonly
   * @type {number}
   * @memberof CoolDown
   */
  public get Remains(): number {
    return this.timer;
  }

  /**
   * Start the cooling.
   *
   * @memberof CoolDown
   */
  public Activate() {
    this.isCooling = true;
  }

  /**
   * Count down for the specified time.
   *
   * @param {number} delta The elapsed time since last update.
   * @returns
   * @memberof CoolDown
   */
  public Cool(delta: number) {
    if (!this.isCooling) {
      return;
    }

    if (this.timer <= delta || delta >= this.cd) {
      this.isCooling = false;
    }

    this.timer = (this.timer - (delta % this.cd) + this.cd) % this.cd;
  }

  /**
   * Reset the countdown state.
   *
   * It will reset its remaining time to the value of its interval.
   *
   * @memberof CoolDown
   */
  public Reset() {
    this.isCooling = false;
    this.timer = this.cd;
  }
}

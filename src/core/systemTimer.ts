export const SystemTimer = new (class SystemTimer {
  public Tick: () => number;

  private lastUpdate: number = 0;
  private lastDelta: number = 0;

  public constructor() {
    this.Tick = this.coldTick;
  }

  public get Delta(): number {
    return this.lastDelta;
  }

  private coldTick = () => {
    this.Tick = this.hotTick;

    this.lastUpdate = performance.now() / 1000;
    return 1 / 60;
  };

  private hotTick = () => {
    const timestamp = performance.now() / 1000;

    this.lastDelta = timestamp - this.lastUpdate;
    this.lastUpdate = timestamp;

    return this.lastDelta;
  };
})();

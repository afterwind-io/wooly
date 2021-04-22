export class SystemTimer {
  private lastUpdate: number = performance.now();
  private lastDelta: number = 0;

  public get Delta(): number {
    return this.lastDelta;
  }

  public Tick(): number {
    const timestamp = performance.now() / 1000;

    this.lastDelta = timestamp - this.lastUpdate;
    this.lastUpdate = timestamp;

    return this.lastDelta;
  }
}

type SignalCallback = (...args: any[]) => void;

export class Signal {
  private sigmap: { [key: string]: SignalCallback[] } = {};

  public Add(signal: string, cb: SignalCallback) {
    // TODO: cb排重
    const map = this.sigmap[signal];

    if (!map) {
      this.sigmap[signal] = [cb];
    } else {
      map.push(cb);
    }
  }

  public Clear() {
    this.sigmap = {};
  }

  public Emit(signal: string, ...args: any[]) {
    const map = this.sigmap[signal];

    if (!map) {
      // #!debug
      console.warn(`${signal} undefined.`);
    } else {
      map.length !== 0 && map.forEach(s => s(...args));
    }
  }

  public Has(name: string): boolean {
    return name in this.sigmap;
  }
}

import { ParamType } from "../util/common";

type SignalCallback = (...args: any[]) => void;

export class Signal<SIGNALS> {
  private sigmap: Partial<Record<keyof SIGNALS, SignalCallback[]>> = {};

  public Connect<S extends keyof SIGNALS>(
    signal: S,
    handler: SIGNALS[S],
    context: any = null
  ) {
    // #!if debug
    if (typeof handler !== "function") {
      throw new Error("[wooly] Signal handler should be a function.");
    }
    // #!endif

    const cb = handler.bind(context);

    const handlers = this.sigmap[signal];
    if (!handlers) {
      this.sigmap[signal] = [cb];
    } else {
      handlers.push(cb);
    }
  }

  public Clear() {
    this.sigmap = {};
  }

  public Emit<S extends keyof SIGNALS>(
    signal: S,
    ...args: ParamType<SIGNALS[S]>
  ) {
    const handlers = this.sigmap[signal];

    if (!handlers) {
      // #!debug
      console.warn(`[wooly] Signal "${signal}" undefined.`);
    } else {
      handlers.length !== 0 && handlers.forEach(s => s(...args));
    }
  }

  public Has(name: keyof SIGNALS): boolean {
    return name in this.sigmap;
  }
}

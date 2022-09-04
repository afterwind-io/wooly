import { ParamType } from "../util/common";

type SignalCallback = (...args: any[]) => void;

export class Signal<SIGNALS extends {} = {}> {
  private signalMap: Partial<Record<keyof SIGNALS, SignalCallback[]>> = {};

  public Connect<S extends keyof SIGNALS>(
    signal: S,
    handler: SIGNALS[S],
    context: any = null
  ) {
    if (typeof handler !== "function") {
      throw new Error("[wooly] Signal handler should be a function.");
    }

    let cb = handler as SignalCallback;
    if (context != null) {
      cb = handler.bind(context);
    }

    const handlers = this.signalMap[signal];
    if (!handlers) {
      this.signalMap[signal] = [cb];
    } else {
      handlers.push(cb);
    }
  }

  public Clear() {
    this.signalMap = {};
  }

  public Disconnect<S extends keyof SIGNALS>(
    signal: S,
    handler: SIGNALS[S]
  ): void {
    const handlers = this.signalMap[signal];
    if (!handlers) {
      return;
    }

    const index = handlers.indexOf(handler as SignalCallback);
    if (index === -1) {
      return;
    }

    handlers.splice(index, 1);
  }

  public Emit<S extends keyof SIGNALS>(
    signal: S,
    ...args: ParamType<SIGNALS[S]>
  ) {
    this.InnerEmit(false, signal, ...args);
  }

  public EmitWithWarning<S extends keyof SIGNALS>(
    signal: S,
    ...args: ParamType<SIGNALS[S]>
  ) {
    this.InnerEmit(true, signal, ...args);
  }

  public Has(name: keyof SIGNALS): boolean {
    return name in this.signalMap;
  }

  private InnerEmit<S extends keyof SIGNALS>(
    warning: boolean,
    signal: S,
    ...args: ParamType<SIGNALS[S]>
  ) {
    const handlers = this.signalMap[signal];

    if (!handlers) {
      if (warning) {
        // #!debug
        console.warn(`[wooly] Signal "${signal as string}" undefined.`);
      }
    } else {
      handlers.length !== 0 && handlers.forEach((s) => s(...args));
    }
  }
}

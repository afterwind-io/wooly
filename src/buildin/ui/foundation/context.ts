import { ProxyWidget } from "./proxyWidget";
import { Widget } from "./widget";

export interface WidgetContextConstructor<T = unknown> {
  new (options: WidgetContextOptions<T>): WidgetContext<T>;
  readonly defaultValue: T;
  Of(host: Widget): T;
  Peek(host: Widget): T;
}

interface WidgetContextOptions<T> {
  child: Widget;
  value: T;
}

export class WidgetContext<T = unknown> extends ProxyWidget<
  WidgetContextOptions<T>
> {
  public static readonly defaultValue: unknown;

  public readonly name: string = "WidgetContext";

  private _dependents: Set<Widget> = new Set();

  public constructor(options: WidgetContextOptions<T>) {
    super(options);
  }

  /**
   * Get the value from the nearest context, and get updated
   * when context updates.
   *
   * @param host The current widget instance
   * @returns The value of the context
   */
  public static Of<T>(host: Widget): T {
    const parentContext = host.FindNearestContext(this);
    if (!parentContext) {
      return this.defaultValue as T;
    }

    const dependents = parentContext._dependents;
    if (!dependents.has(host)) {
      dependents.add(host);
      host.Connect("OnDestroy", () => {
        dependents.delete(host);
      });
    }

    return parentContext.GetContextValue() as T;
  }

  /**
   * Get the value from the nearest context, but does not get updated
   * when context updates.
   *
   * @param host The current widget instance
   * @returns The value of the context
   */
  public static Peek<T>(host: Widget): T {
    const parentContext = host.FindNearestContext(this);
    if (!parentContext) {
      return this.defaultValue as T;
    }

    return parentContext.GetContextValue() as T;
  }

  protected _Destroy(): void {
    this._dependents.clear();
  }

  public GetContextValue(): T {
    return this.options.value;
  }

  public RefreshDependencies(): void {
    for (const widget of this._dependents) {
      if (widget.IsDestroyed) {
        return;
      }

      widget.Refresh();
    }
  }
}

export function CreateWidgetContext<T>(
  defaultValue: T,
  name: string
): WidgetContextConstructor<T> {
  return class WidgetContextExtended extends WidgetContext<T> {
    public static readonly defaultValue = defaultValue;
    public readonly name: string = name;
  };
}

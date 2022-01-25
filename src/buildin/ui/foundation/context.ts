import { ProxyWidget } from "./proxyWidget";
import { Widget } from "./widget";

export interface WidgetContextConstructor<T = unknown> {
  new (options: WidgetContextOptions<T>): WidgetContext<T>;
  readonly defaultValue: T;
  Of(host: Widget): T;
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

  public static Of<T>(host: Widget): T {
    const parentContext = host.FindNearestContext(this);
    if (!parentContext) {
      return this.defaultValue as T;
    }

    parentContext._dependents.add(host);
    host.Connect("OnDestroy", () => {
      parentContext._dependents.delete(host);
    });

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

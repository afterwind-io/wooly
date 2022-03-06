import { EntityTreeManager } from "../../../core/manager/entityTree";
import { Timer } from "../../timer";
import { CompositeWidget } from "../../ui/foundation/compositeWidget";
import { Reactive } from "../../ui/foundation/decorator";
import { Widget } from "../../ui/foundation/widget";
import { MetricBlock } from "./common/metricsBlock";

export class MetricsEntityCounter extends CompositeWidget {
  public readonly name: string = "MetricsEntityCounter";

  private _count: number = 0;

  public _Ready() {
    const timer = new Timer(1, true);
    timer.Connect("OnTimeout", this.RefreshCounter);
    this.AddChild(timer);
  }

  protected _Render(): Widget | null {
    return new MetricBlock({
      title: "Entity Count",
      metric: this._count + "",
    });
  }

  protected GetFirstChild(): Widget | null {
    return (this.child?.sibling as Widget) || null;
  }

  @Reactive
  private RefreshCounter(): void {
    // FIXME high performance impact
    let entities = 0;

    EntityTreeManager.sceneRoot.Traverse((node) => {
      entities++;
    });

    this._count = entities;
  }
}

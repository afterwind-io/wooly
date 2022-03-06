import { SystemTimer } from "../../../core/systemTimer";
import { Timer } from "../../timer";
import { CompositeWidget } from "../../ui/foundation/compositeWidget";
import { Reactive } from "../../ui/foundation/decorator";
import { Widget } from "../../ui/foundation/widget";
import { ThemeContext } from "../common/theme";
import { MetricBlock } from "./common/metricsBlock";

export class MetricsFPS extends CompositeWidget {
  public readonly name: string = "MetricsFPS";

  private _fps: number = 60;

  public _Ready() {
    const timer = new Timer(1, true);
    timer.Connect("OnTimeout", this.RefreshCounter);
    this.AddChild(timer);
  }

  protected _Render(): Widget | null {
    const { colorTextGreen, colorTextRed } = ThemeContext.Of(this);

    const fps = this._fps;
    const color = fps < 30 ? colorTextRed : colorTextGreen;

    return new MetricBlock({
      title: "FPS",
      metric: fps + "",
      metricColor: color,
    });
  }

  protected GetFirstChild(): Widget | null {
    return (this.child?.sibling as Widget) || null;
  }

  @Reactive
  private RefreshCounter(): void {
    const delta = SystemTimer.Delta;
    this._fps = Math.round(100 / delta) / 100;
  }
}

import { Edge } from "../../ui/common/edge";
import { Container } from "../../ui/container";
import { Row } from "../../ui/flex/flex";
import { CompositeWidget } from "../../ui/foundation/compositeWidget";
import { Widget } from "../../ui/foundation/widget";
import { ThemeContext } from "../common/theme";
import { Grid } from "../../ui/grid";
import { MetricsFPS } from "./fps";
import { Box } from "../../ui/box";
import { MetricsEntityCounter } from "./entityCounter";
import { MetricsWidgetCounter } from "./widgetCounter";

export class DevtoolsModulePerformance extends CompositeWidget {
  public readonly name: string = "DevtoolsModulePerformance";

  protected _Render(): Widget | null {
    const { backgroundL3 } = ThemeContext.Of(this);

    return Container.Stretch({
      padding: Edge.All(4),
      child: new Box({
        backgroundColor: backgroundL3,
        padding: Edge.All(4),
        child: Row.Stretch({
          children: [
            new Grid({
              width: 300,
              columnCount: 3,
              rowGap: 4,
              columnGap: 4,
              childAspectRatio: 0.6,
              children: [
                new MetricsFPS({}),
                new MetricsEntityCounter({}),
                new MetricsWidgetCounter({}),
              ],
            }),
          ],
        }),
      }),
    });
  }
}

import { Align, Alignment } from "../../../ui/align";
import { Box } from "../../../ui/box";
import { Edge } from "../../../ui/common/edge";
import { Expanded } from "../../../ui/flex/expanded";
import { Column } from "../../../ui/flex/flex";
import { CompositeWidget } from "../../../ui/foundation/compositeWidget";
import { Widget } from "../../../ui/foundation/widget";
import { ThemeContext } from "../../common/theme";
import { Text } from "../../../ui/text";

interface MetricBlockOptions {
  title: string;
  metric: string;
  metricColor?: string;
}

export class MetricBlock extends CompositeWidget<MetricBlockOptions> {
  public readonly name: string = "MetricBlock";

  protected _Render(): Widget | null {
    const { backgroundL4, colorTextNormal } = ThemeContext.Of(this);

    const { title, metric, metricColor = colorTextNormal } = this.options;

    return new Box({
      backgroundColor: backgroundL4,
      padding: Edge.All(4),
      child: Column.Stretch({
        children: [
          new Text({
            content: title,
            fontSize: 10,
            color: colorTextNormal,
          }),

          new Expanded({
            child: new Align({
              alignment: Alignment.Center,
              child: new Text({
                content: metric,
                fontSize: 24,
                color: metricColor,
              }),
            }),
          }),
        ],
      }),
    });
  }
}

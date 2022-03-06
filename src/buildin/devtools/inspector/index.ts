import { CompositeWidget } from "../../ui/foundation/compositeWidget";
import { Widget } from "../../ui/foundation/widget";
import { ThemeContext } from "../common/theme";
import { BoxDecoration } from "../../ui/boxDecoration";
import { Container } from "../../ui/container";
import { Edge } from "../../ui/common/edge";
import { Scroll, ScrollOverflowBehavior } from "../../ui/scroll/scroll";
import { NodeDetail } from "./adhocs";
import { DevToolsContext } from "../context";

export class DevtoolsModuleInspector extends CompositeWidget {
  public readonly name: string = "DevtoolsModuleInspector";

  protected _Render(): Widget | null {
    const { backgroundL3 } = ThemeContext.Of(this);
    const { inspectingNode } = DevToolsContext.Of(this);

    return Container.Stretch({
      padding: Edge.All(4),
      child: new BoxDecoration({
        backgroundColor: backgroundL3,
        child: new Scroll({
          overflowH: ScrollOverflowBehavior.Limit,
          child: inspectingNode ? NodeDetail(inspectingNode) : null,
        }),
      }),
    });
  }
}

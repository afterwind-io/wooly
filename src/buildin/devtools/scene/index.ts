import { BoxDecoration } from "../../ui/boxDecoration";
import { Edge } from "../../ui/common/edge";
import { Container } from "../../ui/container";
import { CompositeWidget } from "../../ui/foundation/compositeWidget";
import { Widget } from "../../ui/foundation/widget";
import { Scroll } from "../../ui/scroll/scroll";
import { ThemeContext } from "../common/theme";
import { NodeTree } from "./nodeTreeItem";
import { Node } from "../../../core/node";
import { DevToolsContext } from "../context";

export class DevToolsModuleScene extends CompositeWidget {
  public readonly name: string = "DevToolsModuleScene";

  protected _Render(): Widget | null {
    const { backgroundL3 } = ThemeContext.Of(this);
    const { rootNode } = DevToolsContext.Of(this);

    return Container.Stretch({
      padding: Edge.All(4),
      child: new BoxDecoration({
        backgroundColor: backgroundL3,
        child: new Scroll({
          child: Container.Shrink({
            padding: Edge.All(8),
            child: new NodeTree({
              node: rootNode as Node,
            }),
          }),
        }),
      }),
    });
  }
}

import { CompositeWidget } from "../../ui/foundation/compositeWidget";
import { Widget } from "../../ui/foundation/widget";
import { DevToolsContext } from "../context";
import { Node } from "../../../core/node";
import { FlexCrossAxisAlignment, Row } from "../../ui/flex/flex";
import { Text } from "../../ui/text";
import { NodeItem } from "../common/node/item";
import { Scroll, ScrollOverflowBehavior } from "../../ui/scroll/scroll";
import { ThemeContext } from "../common/theme";

export class NodeBreadCrumb extends CompositeWidget {
  public readonly name: string = "NodeBreadCrumb";

  protected _Render(): Widget | null {
    const { rootNode, inspectingNode, InspectNode, PeekNode } =
      DevToolsContext.Of(this);
    const { backgroundL1 } = ThemeContext.Of(this);

    const nodePath = inspectingNode
      ? getNodePath(inspectingNode, rootNode)
      : [];

    return new Scroll({
      overflowV: ScrollOverflowBehavior.Limit,
      child: Row({
        height: "stretch",
        width: "shrink",
        crossAxisAlignment: FlexCrossAxisAlignment.Center,
        children:
          nodePath.length === 0
            ? [
                new Text({
                  content: "No inspecting node.",
                  color: "white",
                }),
              ]
            : nodePath.map((node) =>
                Row.Shrink({
                  children: [
                    new NodeItem({
                      node,
                      onClick: () => InspectNode(node),
                      onHover: (isHovering) =>
                        PeekNode(isHovering ? node : null),
                      backgroundColor:
                        inspectingNode === node ? backgroundL1 : void 0,
                    }),
                  ],
                })
              ),
      }),
    });
  }
}

function getNodePath(target: Node, root: Node): Node[] {
  let path: Node[] = [];

  target.Bubble((node) => {
    path.unshift(node);

    if (node === root) {
      return false;
    }
  }, false);

  return path;
}

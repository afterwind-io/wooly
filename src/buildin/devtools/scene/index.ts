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
import { Column, Flex, Row } from "../../ui/flex/flex";
import { Button } from "../../ui/button";
import { TextInput } from "../../ui/textInput";
import { Box } from "../../ui/box";
import { BindThis } from "../../ui/foundation/decorator";

export class DevToolsModuleScene extends CompositeWidget {
  public readonly name: string = "DevToolsModuleScene";

  protected _Render(): Widget | null {
    const { backgroundL1, backgroundL3 } = ThemeContext.Of(this);
    const { rootNode, isPickingNode } = DevToolsContext.Of(this);

    return Container.Stretch({
      padding: Edge.All(4),
      child: Column.Stretch({
        children: [
          Row({
            width: "stretch",
            height: 32,
            children: [
              Flex.Expanded({
                child: new Box({
                  width: "stretch",
                  height: "shrink",
                  padding: Edge.Horizontal(8),
                  backgroundColor: backgroundL3,
                  border: Edge.All(1),
                  borderColor: backgroundL1,
                  child: new TextInput({
                    width: "stretch",
                    height: 32,
                    value: "",
                    color: "white",
                    placeholder: "Search...",
                    onChange(value) {
                      //
                    },
                  }),
                }),
              }),
              Container.Shrink({
                margin: Edge.Left(8),
                child: new Button({
                  label: isPickingNode ? "Cancel" : "Pick",
                  onClick: this.OnPickNode,
                }),
              }),
            ],
          }),
          Flex.Expanded({
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
          }),
        ],
      }),
    });
  }

  @BindThis
  private OnPickNode(): void {
    const { isPickingNode, PickNode } = DevToolsContext.Of(this);
    PickNode(!isPickingNode);
  }
}

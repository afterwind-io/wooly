import { CompositeWidget } from "../../../ui/foundation/compositeWidget";
import { Widget } from "../../../ui/foundation/widget";
import { Node } from "../../../../core/node";
import { NodeIcon } from ".";
import { Alignment } from "../../../ui/align";
import { Box } from "../../../ui/box";
import { Edge } from "../../../ui/common/edge";
import { FlexCrossAxisAlignment, Row } from "../../../ui/flex/flex";
import { MouseSensor } from "../../../ui/mouseSensor";
import { Text } from "../../../ui/text";
import { ThemeContext } from "../theme";
import { Reactive } from "../../../ui/foundation/decorator";
import { SwitchCursor } from "../../../ui/common/utils";

interface NodeItemBaseOptions {
  backgroundColor?: string;
  node: Node;
  onClick?(): void;
  onHover?(isHovering: boolean): void;
}

export class NodeItem extends CompositeWidget<NodeItemBaseOptions> {
  public readonly name: string = "NodeItemBase";

  private _isHovering: boolean = false;

  @Reactive
  private OnHover(isHovering: boolean): void {
    this._isHovering = isHovering;
    SwitchCursor(isHovering, "pointer");

    this.options.onHover?.(isHovering);
  }

  protected _Render(): Widget | null {
    const { backgroundColor, node, onClick } = this.options;
    const { backgroundL1, colorTextNormal } = ThemeContext.Of(this);

    return Row.Shrink({
      crossAxisAlignment: FlexCrossAxisAlignment.Center,
      children: [
        NodeIcon(node),
        new MouseSensor({
          onClick: onClick,
          onHover: this.OnHover,
          child: new Box({
            width: "shrink",
            height: 18,
            backgroundColor:
              backgroundColor || (this._isHovering ? backgroundL1 : void 0),
            padding: Edge.Horizontal(6),
            alignment: Alignment.Left,
            child: new Text({
              fontSize: 12,
              content: node.GetDisplayName(),
              color: colorTextNormal,
            }),
          }),
        }),
      ],
    });
  }
}

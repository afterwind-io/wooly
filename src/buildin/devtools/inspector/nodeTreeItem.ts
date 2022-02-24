import { Edge } from "../../ui/common/edge";
import { Container } from "../../ui/container";
import { Column, FlexCrossAxisAlignment, Row } from "../../ui/flex/flex";
import { CompositeWidget } from "../../ui/foundation/compositeWidget";
import { Reactive } from "../../ui/foundation/decorator";
import { Widget } from "../../ui/foundation/widget";
import { MouseSensor } from "../../ui/mouseSensor";
import { Transform } from "../../ui/transform";
import { ThemeContext } from "../common/theme";
import { Text } from "../../ui/text";
import { Node } from "../../../core/node";
import { InspectorContext } from "./context";
import { Alignment } from "../../ui/align";
import { SwitchCursor } from "../../ui/common/utils";
import { Input } from "../../media/input";
import { Box } from "../../ui/box";
import { NodeIcon } from "./adhocs";
import { Deg2Rad } from "../../../util/math";

interface NodeTreeOptions {
  node: Node;
  recursiveExpand?: boolean;
}

export class NodeTree extends CompositeWidget<NodeTreeOptions> {
  public readonly name: string = "NodeTree";

  private _isExpanded: boolean;
  private _isRecursiveExpand: boolean;

  public constructor(options: NodeTreeOptions) {
    super(options);

    const { recursiveExpand = false } = options;
    this._isExpanded = recursiveExpand;
    this._isRecursiveExpand = recursiveExpand;
  }

  @Reactive
  private OnExpand(): void {
    this._isExpanded = !this._isExpanded;

    if (Input.IsKeyDown(" ")) {
      this._isRecursiveExpand = true;
    }
  }

  protected _Render(): Widget | null {
    const { node } = this.options;

    let recursiveExpand = this._isRecursiveExpand;
    if (recursiveExpand) {
      this._isRecursiveExpand = false;
    }

    return Column.Shrink({
      children: [
        new NodeTreeItem({
          node,
          isExpand: this._isExpanded,
          onExpand: this.OnExpand,
        }),

        this._isExpanded
          ? Column.Shrink({
              children: node.children.map(
                (child) =>
                  new NodeTree({
                    node: child,
                    recursiveExpand,
                  })
              ),
            })
          : null,
      ],
    });
  }
}

interface NodeTreeItemOptions {
  node: Node;
  isExpand: boolean;
  onExpand(): void;
}

class NodeTreeItem extends CompositeWidget<NodeTreeItemOptions> {
  public readonly name: string = "NodeTreeItem";

  private _isHovering: boolean = false;

  @Reactive
  private OnHover(isHovering: boolean) {
    this._isHovering = isHovering;

    const { node } = this.options;
    const { onPeek } = InspectorContext.Of(this);
    onPeek(isHovering ? node : null);

    SwitchCursor(isHovering, "pointer");
  }

  protected _Render(): Widget | null {
    const { node, isExpand, onExpand } = this.options;

    const { backgroundL1, colorTextNormal } = ThemeContext.Of(this);
    const { inspectingNode, onInspect } = InspectorContext.Of(this);

    // FIXME 用_lastChild判断开销比较小
    const hasChildren = node.children.length !== 0;

    const isInspectingSelf: boolean = inspectingNode === node;

    return Row({
      width: "shrink",
      height: 20,
      crossAxisAlignment: FlexCrossAxisAlignment.Center,
      children: [
        new Container({
          width: 8 * node.depth,
        }),
        Container.Shrink({
          margin: Edge.Right(6),
          child: new Transform({
            rotation: isExpand ? Deg2Rad(90) : 0,
            child: new ExpandSwitcher({
              enabled: hasChildren,
              onExpand,
            }),
          }),
        }),
        NodeIcon(node),
        new MouseSensor({
          onClick: () => onInspect(node),
          onHover: this.OnHover,
          child: new Box({
            width: "shrink",
            backgroundColor:
              isInspectingSelf || this._isHovering ? backgroundL1 : void 0,
            padding: Edge.Horizontal(6),
            alignment: Alignment.Left,
            child: new Text({
              content: node.GetDisplayName(),
              color: colorTextNormal,
            }),
          }),
        }),
      ],
    });
  }
}

interface ExpandSwitcherOptions {
  enabled: boolean;
  onExpand(): void;
}
class ExpandSwitcher extends CompositeWidget<ExpandSwitcherOptions> {
  public readonly name: string = "EntityTreeItemExpandSwitcher";
  public readonly enableDrawing: boolean = true;

  private OnHover(isHovering: boolean) {
    SwitchCursor(isHovering, "pointer");
  }

  public _Draw(ctx: CanvasRenderingContext2D): void {
    const { enabled } = this.options;
    if (!enabled) {
      return;
    }

    ctx.fillStyle = "#FFFFFF";

    ctx.beginPath();
    ctx.lineTo(8, 6);
    ctx.lineTo(3, 10);
    ctx.lineTo(3, 2);

    ctx.fill();
  }

  protected _Render(): Widget | null {
    const { enabled, onExpand } = this.options;

    return enabled
      ? new MouseSensor({
          width: 12,
          height: 12,
          onHover: this.OnHover,
          onClick: onExpand,
        })
      : new Container({ width: 12, height: 12 });
  }
}

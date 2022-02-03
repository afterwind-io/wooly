import { Deg2Rad } from "../../../util/common";
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
import { NoChildWidget } from "../../ui/foundation/noChildWidget";
import { Node } from "../../../core/node";
import { Constraint } from "../../ui/common/constraint";
import { Size } from "../../ui/common/types";
import { WidgetRoot } from "../../ui/root";
import { CanvasLayer } from "../../../core/canvasLayer";
import { CanvasComposition } from "../../../core/canvasComposition";
import { InspectorContext } from "./context";
import { BoxDecoration } from "../../ui/boxDecoration";
import { Align, Alignment } from "../../ui/align";
import { SwitchCursor } from "../../ui/common/utils";
import { Input } from "../../media/input";

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
          child: null,
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
        new TypeIcon({
          node,
        }),
        new MouseSensor({
          onClick: () => onInspect(node),
          onHover: this.OnHover,
          child: new BoxDecoration({
            height: "stretch",
            backgroundColor:
              isInspectingSelf || this._isHovering ? backgroundL1 : void 0,
            child: Container.Shrink({
              padding: Edge.Horizontal(6),
              child: new Align({
                width: "shrink",
                alignment: Alignment.Left,
                child: new Text({
                  content: node.GetDisplayName(),
                  fillStyle: colorTextNormal,
                }),
              }),
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
      : new Container({ width: 12, height: 12, child: null });
  }
}

interface TypeIconOptions {
  node: Node;
}
class TypeIcon extends NoChildWidget<TypeIconOptions> {
  public readonly name: string = "EntityTypeIcon";
  public readonly enableDrawing: boolean = true;

  public _Draw(ctx: CanvasRenderingContext2D): void {
    const { node } = this.options;

    ctx.lineWidth = 2;
    ctx.beginPath();

    if (node instanceof WidgetRoot) {
      ctx.strokeStyle = "hsl(214deg 46% 66%)";
      ctx.moveTo(0, 0);
      ctx.lineTo(12, 0);
      ctx.rect(0, 4, 12, 8);
      ctx.stroke();
    } else if (node instanceof Widget) {
      ctx.strokeStyle = "hsl(214deg 46% 66%)";
      ctx.rect(0, 0, 12, 12);
      ctx.stroke();
    } else if (node instanceof CanvasLayer) {
      ctx.strokeStyle = "hsl(359deg 87% 79%)";
      ctx.rect(0, 0, 9, 9);
      ctx.moveTo(12, 4);
      ctx.lineTo(12, 12);
      ctx.lineTo(4, 12);
      ctx.stroke();
    } else if (node instanceof CanvasComposition) {
      ctx.strokeStyle = "hsl(359deg 87% 79%)";
      ctx.rect(0, 0, 12, 12);
      ctx.fillStyle = "hsl(359deg 87% 79%)";
      ctx.fillRect(5, 5, 7, 7);
      ctx.stroke();
    } else {
      ctx.strokeStyle = "hsl(359deg 87% 79%)";
      ctx.arc(6, 6, 6, 0, 360);
      ctx.stroke();
    }

    ctx.closePath();
  }

  protected _Layout(constraint: Constraint): Size {
    this._intrinsicWidth = 14;
    this._intrinsicHeight = 12;
    return { width: 14, height: 12 };
  }
}

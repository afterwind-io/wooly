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

interface NodeTreeItemOptions {
  node: Node;
  onInspect(entity: Node): void;
}

export class NodeTreeItem extends CompositeWidget<NodeTreeItemOptions> {
  public readonly name: string = "NodeTreeItem";

  private _isExpanded: boolean = false;

  @Reactive
  private OnExpand(): void {
    this._isExpanded = !this._isExpanded;
  }

  protected _Render(): Widget | null {
    const { node, onInspect } = this.options;

    const { colorTextNormal } = ThemeContext.Of(this);

    // FIXME 用_lastChild判断开销比较小
    const hasChildren = node.children.length !== 0;

    return Column.Shrink({
      children: [
        Row({
          width: "shrink",
          height: 20,
          crossAxisAlignment: FlexCrossAxisAlignment.Center,
          children: [
            Container.Shrink({
              margin: Edge.Right(6),
              child: new Transform({
                rotation: this._isExpanded ? Deg2Rad(90) : 0,
                child: new ExpandSwitcher({
                  enabled: hasChildren,
                  onExpand: this.OnExpand,
                }),
              }),
            }),
            Container.Shrink({
              margin: Edge.Right(6),
              child: new TypeIcon({
                node,
              }),
            }),
            new MouseSensor({
              onClick: () => onInspect(node),
              child: new Text({
                content: node.GetDisplayName(),
                fillStyle: colorTextNormal,
              }),
            }),
          ],
        }),

        Container.Shrink({
          padding: Edge.Left(8),
          child: this._isExpanded
            ? Column.Shrink({
                children: node.children.map(
                  (child) =>
                    new NodeTreeItem({
                      node: child,
                      onInspect,
                    })
                ),
              })
            : null,
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
    return { width: 12, height: 12 };
  }
}

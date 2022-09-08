import { Column } from "../../../ui/flex/flex";
import { CompositeWidget } from "../../../ui/foundation/compositeWidget";
import { Widget } from "../../../ui/foundation/widget";
import { WidgetRoot } from "../../../ui/root";
import { NodeDetailSectionTransform, NodeDetailTitle } from "../base/detail";
import { NodeIconBase } from "../../common/node/icon";

interface NodeDetailWidgetRootOptions {
  node: WidgetRoot;
}

export class NodeDetailWidgetRoot extends CompositeWidget<NodeDetailWidgetRootOptions> {
  public readonly name: string = "NodeDetailWidgetRoot";

  protected _Render(): Widget | null {
    const { node } = this.options;

    return Column({
      height: "shrink",
      children: [
        new NodeDetailTitle({
          node,
          icon: new NodeIconWidgetRoot({}),
        }),

        new NodeDetailSectionTransform({ node }),
      ],
    });
  }
}

export class NodeIconWidgetRoot extends NodeIconBase {
  public readonly name: string = "NodeIconWidgetRoot";

  public _Draw(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 2;
    ctx.beginPath();

    ctx.strokeStyle = "hsl(214deg 46% 66%)";
    ctx.moveTo(0, 0);
    ctx.lineTo(12, 0);
    ctx.rect(0, 4, 12, 8);
    ctx.stroke();

    ctx.closePath();
  }
}

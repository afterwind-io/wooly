import { Column } from "../../../ui/flex/flex";
import { CompositeWidget } from "../../../ui/foundation/compositeWidget";
import { Widget } from "../../../ui/foundation/widget";
import {
  NodeDetailSectionTangible,
  NodeDetailSectionTransform,
  NodeDetailTitle,
} from "../base/detail";
import { NodeIconBase } from "../../common/node/icon";

interface NodeDetailWidgetOptions {
  node: Widget;
}

export class NodeDetailWidget extends CompositeWidget<NodeDetailWidgetOptions> {
  public readonly name: string = "NodeDetailWidget";

  protected _Render(): Widget | null {
    const { node } = this.options;

    return Column({
      height: "shrink",
      children: [
        new NodeDetailTitle({
          node,
          icon: new NodeIconWidget({}),
        }),

        new NodeDetailSectionTangible({ node }),
        new NodeDetailSectionTransform({ node }),
      ],
    });
  }
}

export class NodeIconWidget extends NodeIconBase {
  public readonly name: string = "NodeIconWidget";

  public _Draw(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 2;
    ctx.beginPath();

    ctx.strokeStyle = "hsl(214deg 46% 66%)";
    ctx.rect(0, 0, 12, 12);
    ctx.stroke();

    ctx.closePath();
  }
}

import { CanvasLayer } from "../../../../core/canvasLayer";
import { Column } from "../../../ui/flex/flex";
import { CompositeWidget } from "../../../ui/foundation/compositeWidget";
import { Widget } from "../../../ui/foundation/widget";
import {
  NodeDetailSectionTangible,
  NodeDetailSectionTransform,
  NodeDetailTitle,
} from "../base/detail";
import { NodeIconBase } from "../../common/node/icon";

interface NodeDetailCanvasLayerOptions {
  node: CanvasLayer;
}

export class NodeDetailCanvasLayer extends CompositeWidget<NodeDetailCanvasLayerOptions> {
  public readonly name: string = "NodeDetailCanvasLayer";

  protected _Render(): Widget | null {
    const { node } = this.options;

    return Column({
      height: "shrink",
      children: [
        new NodeDetailTitle({
          description: `(${node.index})`,
          node,
          icon: new NodeIconCanvasLayer({}),
        }),

        new NodeDetailSectionTangible({ node }),
        new NodeDetailSectionTransform({ node }),
      ],
    });
  }
}

export class NodeIconCanvasLayer extends NodeIconBase {
  public readonly name: string = "NodeIconCanvasLayer";

  public _Draw(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 2;
    ctx.beginPath();

    ctx.strokeStyle = "hsl(359deg 87% 79%)";
    ctx.rect(0, 0, 9, 9);
    ctx.moveTo(12, 4);
    ctx.lineTo(12, 12);
    ctx.lineTo(4, 12);
    ctx.stroke();

    ctx.closePath();
  }
}

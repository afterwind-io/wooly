import { CanvasComposition } from "../../../../core/canvasComposition";
import { Column } from "../../../ui/flex/flex";
import { CompositeWidget } from "../../../ui/foundation/compositeWidget";
import { Widget } from "../../../ui/foundation/widget";
import {
  NodeDetailSectionTangible,
  NodeDetailSectionTransform,
  NodeDetailTitle,
} from "../base/detail";
import { NodeIcon } from "../base/icon";

interface NodeDetailCanvasCompositionOptions {
  node: CanvasComposition;
}

export class NodeDetailCanvasComposition extends CompositeWidget<NodeDetailCanvasCompositionOptions> {
  public readonly name: string = "NodeDetailCanvasComposition";

  protected _Render(): Widget | null {
    const { node } = this.options;

    return Column({
      height: "shrink",
      children: [
        new NodeDetailTitle({
          description: `(${node.index})`,
          node,
          icon: new NodeIconCanvasComposition({ node }),
        }),

        new NodeDetailSectionTangible({ node }),
        new NodeDetailSectionTransform({ node }),
      ],
    });
  }
}

export class NodeIconCanvasComposition extends NodeIcon {
  public readonly name: string = "NodeIconCanvasComposition";

  public _Draw(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 2;
    ctx.beginPath();

    ctx.strokeStyle = "hsl(359deg 87% 79%)";
    ctx.rect(0, 0, 12, 12);
    ctx.fillStyle = "hsl(359deg 87% 79%)";
    ctx.fillRect(5, 5, 7, 7);
    ctx.stroke();

    ctx.closePath();
  }
}

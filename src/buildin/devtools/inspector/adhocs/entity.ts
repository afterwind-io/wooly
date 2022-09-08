import { Entity } from "../../../../core/entity";
import { Column } from "../../../ui/flex/flex";
import { CompositeWidget } from "../../../ui/foundation/compositeWidget";
import { Widget } from "../../../ui/foundation/widget";
import {
  NodeDetailSectionCustom,
  NodeDetailSectionTangible,
  NodeDetailSectionTransform,
  NodeDetailTitle,
} from "../base/detail";
import { NodeIconBase } from "../../common/node/icon";

interface NodeDetailEntityOptions {
  node: Entity;
}

export class NodeDetailEntity extends CompositeWidget<NodeDetailEntityOptions> {
  public readonly name: string = "NodeDetailEntity";

  protected _Render(): Widget | null {
    const { node } = this.options;

    return Column({
      height: "shrink",
      children: [
        new NodeDetailTitle({
          node,
          icon: new NodeIconEntity({}),
        }),

        new NodeDetailSectionTangible({ node }),
        new NodeDetailSectionTransform({ node }),
        new NodeDetailSectionCustom({ node }),
      ],
    });
  }
}

export class NodeIconEntity extends NodeIconBase {
  public readonly name: string = "NodeIconEntity";

  public _Draw(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 2;
    ctx.beginPath();

    ctx.strokeStyle = "hsl(359deg 87% 79%)";
    ctx.arc(6, 6, 6, 0, 360);
    ctx.stroke();

    ctx.closePath();
  }
}

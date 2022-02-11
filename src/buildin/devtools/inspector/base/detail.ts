import { Alignment } from "../../../ui/align";
import { Box } from "../../../ui/box";
import { Container } from "../../../ui/container";
import { Column, FlexCrossAxisAlignment, Row } from "../../../ui/flex/flex";
import { CompositeWidget } from "../../../ui/foundation/compositeWidget";
import { Widget } from "../../../ui/foundation/widget";
import { Text } from "../../../ui/text";
import { ThemeContext } from "../../common/theme";
import { Edge } from "../../../ui/common/edge";
import { Tangible } from "../../../../core/tangible";
import { Field } from "./field";

interface NodeDetailTitleOptions {
  description?: string;
  node: Tangible;
  icon: Widget;
}

export class NodeDetailTitle extends CompositeWidget<NodeDetailTitleOptions> {
  public readonly name: string = "NodeDetailTitle";

  protected _Render(): Widget | null {
    const { colorTextNormal } = ThemeContext.Of(this);
    const { description = "", node, icon } = this.options;

    return new Container({
      height: 32,
      padding: Edge.Horizontal(8),
      child: Row({
        crossAxisAlignment: FlexCrossAxisAlignment.Center,
        children: [
          icon,

          Container.Shrink({
            margin: Edge.Left(6),
            child: new Text({
              content: `${node.GetDisplayName()} ${description}`,
              color: colorTextNormal,
            }),
          }),
        ],
      }),
    });
  }
}

interface NodeDetailSectionTitleOptions {
  title: Widget;
}

export class NodeDetailSectionTitle extends CompositeWidget<NodeDetailSectionTitleOptions> {
  public readonly name: string = "NodeDetailSectionTitle";

  protected _Render(): Widget | null {
    const { backgroundL1 } = ThemeContext.Of(this);
    const { title } = this.options;

    return new Box({
      alignment: Alignment.Center,
      backgroundColor: backgroundL1,
      child: title,
      height: 20,
    });
  }
}

interface NodeDetailCommonOptions {
  title: string;
  fields: Widget[];
}

export class NodeDetailSection extends CompositeWidget<NodeDetailCommonOptions> {
  public readonly name: string = "NodeDetailSection";

  protected _Render(): Widget | null {
    const { colorTextNormal } = ThemeContext.Of(this);
    const { title, fields } = this.options;

    return Column({
      height: "shrink",
      children: [
        new NodeDetailSectionTitle({
          title: new Text({
            content: title,
            color: colorTextNormal,
          }),
        }),

        new Container({
          padding: new Edge(8, 8, 4, 4),
          height: "shrink",
          child: Column({
            height: "shrink",
            children: fields,
          }),
        }),
      ],
    });
  }
}

interface NodeDetailSectionTangibleOptions {
  node: Tangible;
}

/**
 * Tangible 信息块
 *
 * - 屏幕位置
 * - 尺寸
 */
export class NodeDetailSectionTangible extends CompositeWidget<NodeDetailSectionTangibleOptions> {
  public readonly name: string = "NodeDetailSectionTangible";

  protected _Render(): Widget | null {
    const { node } = this.options;

    return new NodeDetailSection({
      title: "Tangible",
      fields: [
        new Field({
          label: "ScreenPosition",
          value: node.screenTransform.translation,
        }),
        new Field({
          label: "Dimension",
          value: node.dimension,
        }),
      ],
    });
  }
}

interface NodeDetailSectionTransformOptions {
  node: Tangible;
}

/**
 * Transform 信息块
 *
 * - Origin
 * - Position
 * - Rotation
 * - Scale
 */
export class NodeDetailSectionTransform extends CompositeWidget<NodeDetailSectionTransformOptions> {
  public readonly name: string = "NodeDetailSectionTransform";

  protected _Render(): Widget | null {
    const { node } = this.options;

    return new NodeDetailSection({
      title: "Transform",
      fields: [
        new Field({
          label: "Origin",
          value: node.origin,
        }),
        new Field({
          label: "Position",
          value: node.position,
        }),
        new Field({
          label: "Rotation",
          value: node.rotation,
        }),
        new Field({
          label: "Scale",
          value: node.scale,
        }),
      ],
    });
  }
}

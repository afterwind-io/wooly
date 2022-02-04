import { Vector2 } from "../../util/vector2";
import { Align, Alignment, AlignOptions } from "./align";
import { BoxDecoration, BoxDecorationOptions } from "./boxDecoration";
import { Edge } from "./common/edge";
import { Container, ContainerOptions } from "./container";
import { CompositeWidget } from "./foundation/compositeWidget";
import { Widget } from "./foundation/widget";

type BoxOptions = AlignOptions & BoxDecorationOptions & ContainerOptions;

export class Box extends CompositeWidget<BoxOptions> {
  public readonly name: string = "Box";

  protected _Render(): Widget | null {
    const {
      alignment,
      offset,
      margin,
      border,
      padding,
      width,
      height,
      child,
      backgroundColor,
      borderColor,
      shadows,
    } = this.options as Required<BoxOptions>;

    return new BoxDecoration({
      width,
      height,
      backgroundColor,
      border,
      borderColor,
      shadows,
      child: new Container({
        width,
        height,
        margin,
        padding,
        child: new Align({
          width,
          height,
          alignment,
          offset,
          child,
        }),
      }),
    });
  }

  protected NormalizeOptions(options: BoxOptions): BoxOptions {
    return {
      ...options,
      width: options.width ?? "stretch",
      height: options.height ?? "stretch",
      alignment: options.alignment || Alignment.TopLeft,
      offset: options.offset || Vector2.Zero,
      margin: options.margin || Edge.None,
      border: options.border || Edge.None,
      padding: options.padding || Edge.None,
    };
  }
}

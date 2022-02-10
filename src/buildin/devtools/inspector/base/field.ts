import { Vector2 } from "../../../../util/vector2";
import { Alignment } from "../../../ui/align";
import { Box } from "../../../ui/box";
import { Edge } from "../../../ui/common/edge";
import { Container } from "../../../ui/container";
import { FlexCrossAxisAlignment, Row } from "../../../ui/flex/flex";
import { CompositeWidget } from "../../../ui/foundation/compositeWidget";
import { Widget } from "../../../ui/foundation/widget";
import { Text } from "../../../ui/text";
import { ThemeContext } from "../../common/theme";

interface FieldOptions {
  label: string;
  value: unknown;
}

export class Field extends CompositeWidget<FieldOptions> {
  public readonly name: string = "Field";

  protected _Render(): Widget | null {
    const { label, value } = this.options;
    const { colorTextNormal } = ThemeContext.Of(this);

    const fieldValueWidget = this.PickFieldValueWidget(value);

    return new Container({
      height: 24,
      margin: Edge.Bottom(4),
      child: Row({
        crossAxisAlignment: FlexCrossAxisAlignment.Center,
        children: [
          Row.Expanded({
            height: "shrink",
            child: new Text({
              content: label,
              fillStyle: colorTextNormal,
            }),
          }),
          Row.Expanded({
            child: fieldValueWidget,
          }),
        ],
      }),
    });
  }

  private PickFieldValueWidget(value: unknown): Widget {
    if (value instanceof Vector2) {
      return new FieldValueVector2({ value });
    }

    return new FieldValuePlain({ value });
  }
}

interface FieldValuePlainOptions {
  value: unknown;
}

class FieldValuePlain extends CompositeWidget<FieldValuePlainOptions> {
  public readonly name: string = "FieldValuePlain";

  protected _Render(): Widget | null {
    const { value } = this.options;

    const { backgroundL2, colorTextNormal } = ThemeContext.Of(this);

    return new Box({
      padding: Edge.Horizontal(8),
      alignment: Alignment.Left,
      backgroundColor: backgroundL2,
      child: new Text({
        content: value + "",
        fillStyle: colorTextNormal,
      }),
    });
  }
}

interface FieldValueVector2Options {
  value: Vector2;
}

class FieldValueVector2 extends CompositeWidget<FieldValueVector2Options> {
  public readonly name: string = "FieldValueVector2";

  protected _Render(): Widget | null {
    const { value } = this.options;

    const { backgroundL2, colorTextNormal, colorTextRed, colorTextBlue } =
      ThemeContext.Of(this);

    return Row.Stretch({
      children: [
        new Box({
          width: "shrink",
          padding: Edge.Horizontal(4),
          alignment: Alignment.Center,
          child: new Text({
            content: "x",
            fillStyle: colorTextRed,
          }),
        }),
        Row.Expanded({
          child: new Box({
            padding: Edge.Horizontal(8),
            alignment: Alignment.Left,
            backgroundColor: backgroundL2,
            child: new Text({
              content: value.x + "",
              fillStyle: colorTextNormal,
            }),
          }),
        }),
        new Box({
          width: "shrink",
          padding: Edge.Horizontal(4),
          alignment: Alignment.Center,
          child: new Text({
            content: "y",
            fillStyle: colorTextBlue,
          }),
        }),
        Row.Expanded({
          child: new Box({
            padding: Edge.Horizontal(8),
            alignment: Alignment.Left,
            backgroundColor: backgroundL2,
            child: new Text({
              content: value.y + "",
              fillStyle: colorTextNormal,
            }),
          }),
        }),
      ],
    });
  }
}

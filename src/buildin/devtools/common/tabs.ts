import { Align, Alignment } from "../../ui/align";
import { BoxDecoration } from "../../ui/boxDecoration";
import { Edge } from "../../ui/common/edge";
import { Length } from "../../ui/common/types";
import { Container } from "../../ui/container";
import { Column, Flex, Row } from "../../ui/flex/flex";
import { CompositeWidget } from "../../ui/foundation/compositeWidget";
import { SingleChildWidget } from "../../ui/foundation/singleChildWidget";
import { SizableWidgetOptions } from "../../ui/foundation/types";
import { Text } from "../../ui/text";
import { Widget } from "../../ui/foundation/widget";
import { ThemeContext } from "./theme";
import { MouseSensor } from "../../ui/mouseSensor";
import { BindThis } from "../../ui/foundation/decorator";
import { SwitchCursor } from "../../ui/common/utils";

interface TabsOptions extends SizableWidgetOptions {
  activeTab?: string;
  children: Tab[];
  onSwitchTab(label: string): void;
}

export class Tabs extends SingleChildWidget<TabsOptions> {
  public readonly name: string = "Tabs";

  protected readonly isLooseBox: boolean = false;

  @BindThis
  private OnSwitchTab(label: string): void {
    const { onSwitchTab } = this.options;
    onSwitchTab(label);
  }

  protected _Render(): Widget | null {
    const { backgroundL2 } = ThemeContext.Of(this);

    const children = this.options.children;
    if (children.length === 0) {
      return null;
    }

    const currentTab =
      children.find(
        (child) => child.options.label === this.options.activeTab
      ) || children[0];

    return Column.Stretch({
      children: [
        // 标签栏
        Row({
          width: "stretch",
          height: 36,
          children: children.map(
            (child) =>
              new TabLabel({
                isActive: currentTab.options.label === child.options.label,
                label: child.options.label,
                OnSwitchTab: this.OnSwitchTab,
              })
          ),
        }),

        // 标签页
        Flex.Expanded({
          child: new BoxDecoration({
            width: "stretch",
            height: "stretch",
            backgroundColor: backgroundL2,
            child: currentTab,
          }),
        }),
      ],
    });
  }

  protected GetHeight(): Length {
    return this.options.height!;
  }

  protected GetWidth(): Length {
    return this.options.width!;
  }

  protected NormalizeOptions(options: TabsOptions): TabsOptions {
    return {
      width: "stretch",
      height: "stretch",
      ...options,
    };
  }
}

interface TabLabelOptions {
  isActive: boolean;
  label: string;
  OnSwitchTab: (label: string) => void;
}

class TabLabel extends CompositeWidget<TabLabelOptions> {
  public readonly name: string = "TabLabel";

  @BindThis
  private OnHover(isHovering: boolean): void {
    SwitchCursor(isHovering, "pointer");
  }

  @BindThis
  private OnClick(): void {
    this.options.OnSwitchTab(this.options.label);
  }

  protected _Render(): Widget | null {
    const { backgroundL2, backgroundL3, colorTextNormal, colorTextInactive } =
      ThemeContext.Of(this);

    const { isActive, label } = this.options;

    return new MouseSensor({
      onHover: this.OnHover,
      onClick: this.OnClick,
      child: new BoxDecoration({
        key: label,
        height: "stretch",
        backgroundColor: isActive ? backgroundL2 : backgroundL3,
        child: Container.Shrink({
          margin: Edge.Right(2),
          padding: Edge.Horizontal(8),
          child: new Align({
            width: "shrink",
            alignment: Alignment.Center,
            child: new Text({
              content: label,
              fillStyle: isActive ? colorTextNormal : colorTextInactive,
            }),
          }),
        }),
      }),
    });
  }
}

interface TabOptions {
  label: string;
  child: Widget | null;
}

export class Tab extends CompositeWidget<TabOptions> {
  public readonly name: string = "Tab";

  protected _Render(): Widget | null {
    return this.options.child;
  }
}

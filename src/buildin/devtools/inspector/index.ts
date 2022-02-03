import { CanvasLayer } from "../../../core/canvasLayer";
import { CompositeWidget } from "../../ui/foundation/compositeWidget";
import { Node } from "../../../core/node";
import { Widget } from "../../ui/foundation/widget";
import { GetUniqId } from "../../../util/idgen";
import { BindThis, Reactive } from "../../ui/foundation/decorator";
import { RenderTreeManager } from "../../../core/manager/renderTree";
import { ThemeContext } from "../common/theme";
import { Column, Flex, Row } from "../../ui/flex/flex";
import { BoxDecoration } from "../../ui/boxDecoration";
import { NodeTree } from "./nodeTreeItem";
import { Button } from "../../ui/button";
import { Container } from "../../ui/container";
import { Edge } from "../../ui/common/edge";
import { Scroll } from "../../ui/scroll/scroll";
import { NodeDetail } from "./nodeDetail";
import { NodeMask } from "./nodeMask";
import { InspectorContext } from "./context";

export class DevToolsInspector extends CompositeWidget {
  public readonly name: string = "DevToolsInspector";

  private $layer!: CanvasLayer;
  private $mask!: NodeMask;
  private _inspectingNode: Widget | null = null;
  private _snapshot: Node | null = null;

  protected _Ready(): void {
    const layer = new CanvasLayer(10000000 + GetUniqId());
    this.$layer = layer;
    this.AddChild(this.$layer);

    const mask = new NodeMask();
    this.$mask = mask;
    layer.AddChild(mask);
  }

  protected _Destroy(): void {
    this.$mask._inspectingNode = null;

    this._snapshot = null;
    this._inspectingNode = null;
  }

  protected _Render(): Widget | null {
    const { backgroundL3 } = ThemeContext.Of(this);

    return new InspectorContext({
      value: {
        inspectingNode: this._inspectingNode,
        onInspect: this.OnInspectNode,
        onPeek: this.OnPeekNode,
      },
      child: Column.Stretch({
        children: [
          // 操作栏
          new BoxDecoration({
            width: "stretch",
            child: Row.Shrink({
              children: [
                new Button({
                  label: "Take Snapshot",
                  onClick: this.OnSnapshot,
                }),
                new Button({
                  label: "Resume",
                  onClick: () => {},
                }),
              ],
            }),
          }),

          // 页
          Flex.Expanded({
            child: Row.Stretch({
              children: [
                // 侧边栏 root
                Flex.Expanded({
                  flex: 3,
                  child: Container.Stretch({
                    padding: Edge.All(4),
                    child: new BoxDecoration({
                      width: "stretch",
                      height: "stretch",
                      backgroundColor: backgroundL3,
                      child: new Scroll({
                        child: Container.Shrink({
                          padding: Edge.All(8),
                          child: this._snapshot
                            ? new NodeTree({
                                node: this._snapshot as Node,
                              })
                            : null,
                        }),
                      }),
                    }),
                  }),
                }),

                // 详情
                Flex.Expanded({
                  flex: 5,
                  child: Container.Stretch({
                    padding: new Edge(0, 4, 4, 4),
                    child: new BoxDecoration({
                      width: "stretch",
                      height: "stretch",
                      backgroundColor: backgroundL3,
                      child: new Scroll({
                        child: this._inspectingNode
                          ? new NodeDetail({
                              node: this._inspectingNode,
                            })
                          : null,
                      }),
                    }),
                  }),
                }),
              ],
            }),
          }),
        ],
      }),
    });
  }

  /**
   * @override
   */
  protected GetFirstChild(): Widget | null {
    return this.child!.sibling as Widget | null;
  }

  @Reactive
  private OnInspectNode(node: Widget): void {
    this.$mask._inspectingNode = node;

    this._inspectingNode = node;
    console.log(node);
  }

  @BindThis
  private OnPeekNode(node: Node): void {
    this.$mask._peekingNode = node;
  }

  @Reactive
  private OnSnapshot(): void {
    let compositionRoot = RenderTreeManager.compositionRoot;
    if (!compositionRoot) {
      return;
    }

    this._snapshot = compositionRoot.root;
  }
}

import { Entity } from "../../core/entity";
import { CanvasManager } from "../../core/manager/canvas";
import { GetUniqId } from "../../util/idgen";
import { Edge } from "../ui/common/edge";
import { Container } from "../ui/container";
import { Column, Flex, Row } from "../ui/flex/flex";
import { CompositeWidget } from "../ui/foundation/compositeWidget";
import { BindThis, Reactive } from "../ui/foundation/decorator";
import { Widget } from "../ui/foundation/widget";
import { Tab, Tabs } from "./common/tabs";
import { ThemeContext } from "./common/theme";
import { Node } from "../../core/node";
import { CanvasLayer } from "../../core/canvasLayer";
import { NodeMask } from "./inspector/nodeMask";
import { DevToolsContext } from "./context";
import { Box } from "../ui/box";
import { DevtoolsModulePerformance } from "./performance";
import { DevToolsModulePlayer } from "./player";
import { DevToolsModuleScene } from "./scene";
import { DevtoolsModuleInspector } from "./inspector";

export class DevToolsApp extends CompositeWidget {
  public readonly name: string = "DevToolsApp";

  private $layer!: CanvasLayer;
  private $mask!: NodeMask;
  private _inspectingNode: Node | null = null;
  private _root: Entity;
  private _rootBuilder: () => Entity;
  private _rootVersion: number = 0;

  public constructor(builder: () => Entity) {
    super({});

    this._rootBuilder = builder;
    this._root = builder();
  }

  protected _Ready(): void {
    const layer = new CanvasLayer(10000000 + GetUniqId());
    this.$layer = layer;
    this.AddChild(this.$layer);

    const mask = new NodeMask();
    this.$mask = mask;
    layer.AddChild(mask);
  }

  protected _Render(): Widget | null {
    const { backgroundL4 } = ThemeContext.Of(this);

    const { x, y } = CanvasManager.Dimension;
    return new DevToolsContext({
      value: {
        inspectingNode: this._inspectingNode,
        rootNode: this._root,
        rootNodeVersion: this._rootVersion,
        InspectNode: this.OnInspectNode,
        PeekNode: this.OnPeekNode,
        PauseGame: this.OnPauseGame,
        RestartGame: this.OnRestartGame,
      },
      child: new Box({
        width: x,
        height: y,
        backgroundColor: backgroundL4,
        padding: Edge.All(8),
        child: Row({
          children: [
            new Container({
              width: 250,
              child: new Tabs({
                activeTab: "Scene",
                onSwitchTab: () => {},
                children: [
                  new Tab({
                    label: "Scene",
                    child: new DevToolsModuleScene({}),
                  }),
                ],
              }),
            }),

            Flex.Expanded({
              child: Container.Stretch({
                padding: Edge.Horizontal(4),
                child: Column.Stretch({
                  children: [
                    Flex.Expanded({
                      child: new Tabs({
                        activeTab: "Game",
                        onSwitchTab: () => {},
                        children: [
                          new Tab({
                            label: "Game",
                            child: new DevToolsModulePlayer({}),
                          }),
                        ],
                      }),
                    }),

                    new Container({
                      margin: Edge.Top(4),
                      height: 200,
                      child: new Tabs({
                        activeTab: "Performance",
                        onSwitchTab: () => {},
                        children: [
                          new Tab({
                            label: "Performance",
                            child: new DevtoolsModulePerformance({}),
                          }),
                          new Tab({
                            label: "Debug",
                            child: null,
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              }),
            }),

            new Container({
              width: 250,
              child: new Tabs({
                activeTab: "Inspector",
                onSwitchTab: () => {},
                children: [
                  new Tab({
                    label: "Inspector",
                    child: new DevtoolsModuleInspector({}),
                  }),
                  new Tab({
                    label: "Setting",
                    child: null,
                  }),
                ],
              }),
            }),
          ],
        }),
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

  @BindThis
  private OnPauseGame(): void {
    this._root.paused = !this._root.paused;
  }

  @Reactive
  private OnRestartGame(): void {
    this._root = this._rootBuilder();
    this._rootVersion++;
  }
}

import { GetUniqId } from "../../../util/idgen";
import { Vector2 } from "../../../util/vector2";
import { Button } from "../../ui/button";
import { Edge } from "../../ui/common/edge";
import { Container } from "../../ui/container";
import { Column, Flex, FlexCrossAxisAlignment, Row } from "../../ui/flex/flex";
import { CompositeWidget } from "../../ui/foundation/compositeWidget";
import { Widget } from "../../ui/foundation/widget";
import { DevToolsContext } from "../context";
import { Text } from "../../ui/text";
import { BindThis, Reactive } from "../../ui/foundation/decorator";
import { ThemeContext } from "../common/theme";
import { Input } from "../../../core/manager/input";
import {
  CompositionContext,
  RenderTreeManager,
} from "../../../core/manager/renderTree";
import { DEVTOOL_ROOT_SCOPE } from "../const";
import { Stack } from "../../ui/stack";
import { CanvasItem } from "../../../core/canvasItem";
import { GameHost } from "./gameHost";
import { MouseCapture } from "./mouseCapture";
import { NodeBreadCrumb } from "./nodeBreadcrumb";

export class DevToolsModulePlayer extends CompositeWidget {
  public readonly name: string = "DevToolsModulePlayer";

  private _playerDimension: Vector2 = Vector2.Zero;
  private _playerMousePosition: Vector2 = Vector2.Zero;
  private _playerCompositionIndex: number = GetUniqId();

  protected _Render(): Widget | null {
    const { colorTextNormal } = ThemeContext.Of(this);
    const { isGamePaused, rootNode, inspectingNode, PauseGame, InspectNode } =
      DevToolsContext.Of(this);

    const info = `@(${this._playerMousePosition.x},${this._playerMousePosition.y}) | ${this._playerDimension.x} x ${this._playerDimension.y}`;
    return new Container({
      padding: Edge.All(4),
      child: Column.Stretch({
        children: [
          Row({
            height: 32,
            crossAxisAlignment: FlexCrossAxisAlignment.Center,
            children: [
              new Button({
                label: isGamePaused ? "Continue" : "Pause",
                onClick: PauseGame,
              }),

              Flex.Expanded({ child: null }),

              new Text({
                content: info,
                color: colorTextNormal,
              }),
            ],
          }),

          Flex.Expanded({
            child: new Stack({
              children: [
                new GameHost({
                  root: rootNode,
                  compositionIndex: this._playerCompositionIndex,
                  onDimensionChange: this.OnPlayerDimensionChange,
                }),
                new MouseCapture({
                  onPlayerMouseMove: this.OnPlayerMouseMove,
                  onPlayerMouseClick: this.OnPlayerMouseClick,
                }),
              ],
            }),
          }),

          Row({
            height: 32,
            crossAxisAlignment: FlexCrossAxisAlignment.Center,
            children: [
              Flex.Expanded({ child: new NodeBreadCrumb({}) }),

              !inspectingNode
                ? null
                : new Button({
                    label: "Clear",
                    onClick: () => InspectNode(null),
                  }),
            ],
          }),
        ],
      }),
    });
  }

  @Reactive
  private OnPlayerDimensionChange(dimension: Vector2): void {
    this._playerDimension = dimension;
  }

  @BindThis
  private OnPlayerMouseClick(): void {
    const { isPickingNode, peekingNode, InspectNode } =
      DevToolsContext.Of(this);

    if (!isPickingNode) {
      return;
    }

    InspectNode(peekingNode);
  }

  @Reactive
  private OnPlayerMouseMove(): void {
    const inGameMousePosition = Input.GetMousePosition(0);
    this._playerMousePosition = inGameMousePosition;

    const { isPickingNode, PeekNode } = DevToolsContext.Of(this);
    if (!isPickingNode) {
      return;
    }

    const mousePosition = Input.GetMousePosition(DEVTOOL_ROOT_SCOPE);

    function recursiveHitTest(
      context: CompositionContext,
      onHit: (node: CanvasItem) => void
    ): false | void {
      return context.ReverseTraverse((node) => {
        if (node instanceof CanvasItem) {
          if (node.HitTest(mousePosition)) {
            onHit(node);
            return false;
          }
        } else {
          return recursiveHitTest(node, onHit);
        }
      });
    }

    RenderTreeManager.compositionRoot.Traverse((node) => {
      if (
        node instanceof CompositionContext &&
        node.root.index === this._playerCompositionIndex
      ) {
        recursiveHitTest(node, (target) => {
          PeekNode(target);
        });
        return false;
      }
    });
  }
}

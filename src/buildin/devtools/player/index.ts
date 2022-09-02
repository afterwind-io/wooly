import { CanvasComposition } from "../../../core/canvasComposition";
import { Entity } from "../../../core/entity";
import {
  LogicalDimension,
  LogicalScreenOffsetMap,
} from "../../../core/globals";
import { GetUniqId } from "../../../util/idgen";
import { Matrix2d } from "../../../util/matrix2d";
import { Vector2 } from "../../../util/vector2";
import { Button } from "../../ui/button";
import { Constraint } from "../../ui/common/constraint";
import { Edge } from "../../ui/common/edge";
import { Size } from "../../ui/common/types";
import { Container } from "../../ui/container";
import { Column, Flex, FlexCrossAxisAlignment, Row } from "../../ui/flex/flex";
import { CompositeWidget } from "../../ui/foundation/compositeWidget";
import { NoChildWidget } from "../../ui/foundation/noChildWidget";
import { Widget } from "../../ui/foundation/widget";
import { DevToolsContext } from "../context";
import { Text } from "../../ui/text";
import { Node } from "../../../core/node";
import { Reactive } from "../../ui/foundation/decorator";
import { ThemeContext } from "../common/theme";

export class DevToolsModulePlayer extends CompositeWidget {
  public readonly name: string = "DevToolsModuleGame";

  private _playerDimension: Vector2 = Vector2.Zero;

  protected _Render(): Widget | null {
    const { colorTextNormal } = ThemeContext.Of(this);
    const { rootNode, rootNodeVersion, PauseGame, RestartGame } =
      DevToolsContext.Of(this);

    return new Container({
      padding: Edge.All(4),
      child: Column.Stretch({
        children: [
          Row({
            height: 32,
            crossAxisAlignment: FlexCrossAxisAlignment.Center,
            children: [
              new Button({
                label: "Pause/Play",
                onClick: PauseGame,
              }),
              new Button({
                label: "Restart",
                onClick: RestartGame,
              }),

              Flex.Expanded({ child: null }),

              new Text({
                content: `${this._playerDimension.x} x ${this._playerDimension.y}`,
                color: colorTextNormal,
              }),
            ],
          }),

          Flex.Expanded({
            child: new GameHost({
              key: rootNodeVersion,
              root: rootNode,
              onDimensionChange: this.OnPlayerDimensionChange,
            }),
          }),
        ],
      }),
    });
  }

  @Reactive
  private OnPlayerDimensionChange(dimension: Vector2): void {
    this._playerDimension = dimension;
  }
}

class TransformReset extends Entity {
  public get globalTransform(): Matrix2d {
    return Matrix2d.Identity();
  }
}

interface GameHostOptions {
  root: Node;
  onDimensionChange(dimension: Vector2): void;
}

class GameHost extends NoChildWidget<GameHostOptions> {
  public readonly name: string = "GameHost";
  public readonly childSizeIndependent: boolean = true;

  private $composition!: CanvasComposition;
  private _deferInit: number = 0;

  protected _Ready(): void {
    this.$composition = new CanvasComposition(GetUniqId());
  }

  public _Update(delta: number): void {
    const flag = this._deferInit;

    if (flag === 0) {
      this._deferInit++;
    } else if (flag === 1) {
      this.$composition.scope = 0;
      this.$composition.AddChild(this.options.root);

      const reset = new TransformReset();
      reset.AddChild(this.$composition);
      this.AddChild(reset);

      const screenPosition = this.ConvertToScreenSpace();
      LogicalScreenOffsetMap[0] = screenPosition;

      this._deferInit++;
    } else if (flag === 2) {
      const { onDimensionChange } = this.options;
      onDimensionChange(LogicalDimension);

      this._deferInit++;
    }
  }

  protected _Layout(constraint: Constraint): Size {
    const { maxWidth, maxHeight } = constraint;

    this._intrinsicWidth = maxWidth;
    this._intrinsicHeight = maxHeight;

    this.$composition.SetSize(new Vector2(maxWidth, maxHeight));

    LogicalDimension.x = maxWidth;
    LogicalDimension.y = maxHeight;

    return { width: maxWidth, height: maxHeight };
  }
}

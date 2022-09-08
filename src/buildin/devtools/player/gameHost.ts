import { CanvasComposition } from "../../../core/canvasComposition";
import { Entity } from "../../../core/entity";
import {
  LogicalScreenOffsetMap,
  LogicalDimension,
} from "../../../core/globals";
import { Node } from "../../../core/node";
import { Matrix2d } from "../../../util/matrix2d";
import { Vector2 } from "../../../util/vector2";
import { Constraint } from "../../ui/common/constraint";
import { Size } from "../../ui/common/types";
import { NoChildWidget } from "../../ui/foundation/noChildWidget";

class TransformReset extends Entity {
  public readonly name: string = "TransformReset";

  public get globalTransform(): Matrix2d {
    return Matrix2d.Identity();
  }
}

interface GameHostOptions {
  root: Node;
  compositionIndex: number;
  onDimensionChange(dimension: Vector2): void;
}

export class GameHost extends NoChildWidget<GameHostOptions> {
  public readonly name: string = "GameHost";
  public readonly childSizeIndependent: boolean = true;

  private $composition!: CanvasComposition;
  private _deferInit: number = 0;

  protected _Ready(): void {
    this.$composition = new CanvasComposition(this.options.compositionIndex);
  }

  public _Update(): void {
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

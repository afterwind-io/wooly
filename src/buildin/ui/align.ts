import { SingleChildWidget } from "./foundation/singleChildWidget";
import {
  SingleChildWidgetOptions,
  SizableWidgetOptions,
  WidgetElement,
} from "./foundation/types";
import { Vector2 } from "../../util/vector2";
import { Length } from "./common/types";
import { MathEx } from "../../util/math";

export class Alignment {
  public readonly x: number;
  public readonly y: number;

  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public static get TopLeft(): Alignment {
    return new Alignment(0, 0);
  }

  public static get Top(): Alignment {
    return new Alignment(0.5, 0);
  }

  public static get TopRight(): Alignment {
    return new Alignment(1, 0);
  }

  public static get Left(): Alignment {
    return new Alignment(0, 0.5);
  }

  public static get Center(): Alignment {
    return new Alignment(0.5, 0.5);
  }

  public static get Right(): Alignment {
    return new Alignment(1, 0.5);
  }

  public static get BottomLeft(): Alignment {
    return new Alignment(0, 1);
  }

  public static get Bottom(): Alignment {
    return new Alignment(0.5, 1);
  }

  public static get BottomRight(): Alignment {
    return new Alignment(1, 1);
  }
}

type BaseOptions = SizableWidgetOptions & SingleChildWidgetOptions;

export interface AlignOptions extends BaseOptions {
  alignment?: Alignment;
  offset?: Vector2;
}

export class Align extends SingleChildWidget<AlignOptions> {
  public readonly name: string = "Align";

  protected readonly isLooseBox: boolean = true;

  public static Center(options: Omit<AlignOptions, "alignment">): Align {
    return new Align({ ...options, alignment: Alignment.Center });
  }

  protected _Render(): WidgetElement {
    return this.options.child;
  }

  protected GetHeight(): Length {
    return this.options.height!;
  }

  protected GetWidth(): Length {
    return this.options.width!;
  }

  protected NormalizeOptions(options: AlignOptions): AlignOptions {
    return {
      ...options,
      width: options.width ?? "stretch",
      height: options.height ?? "stretch",
      alignment: options.alignment || Alignment.TopLeft,
      offset: options.offset || Vector2.Zero,
    };
  }

  protected PerformLayout() {
    const child = this.GetFirstChild();
    if (!child) {
      return;
    }

    const { alignment, offset } = this.options as Required<AlignOptions>;

    const width = this._intrinsicWidth;
    const height = this._intrinsicHeight;
    const childWidth = child._intrinsicWidth;
    const childHeight = child._intrinsicHeight;

    const maxPosX = width - childWidth;
    const centerX = MathEx.Clamp(
      width * alignment.x - childWidth / 2,
      0,
      maxPosX
    );

    const maxPosY = height - childHeight;
    const centerY = MathEx.Clamp(
      height * alignment.y - childHeight / 2,
      0,
      maxPosY
    );

    const childPosition = new Vector2(
      MathEx.Clamp(centerX + offset.x, 0, maxPosX),
      MathEx.Clamp(centerY + offset.y, 0, maxPosY)
    );
    child.position = childPosition;
  }
}

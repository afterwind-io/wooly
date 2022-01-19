import { Length } from "../common/types";
import { SingleChildWidget } from "../foundation/singleChildWidget";
import { CommonWidgetOptions, WidgetElement } from "../foundation/types";
import { MouseSensor } from "../mouseSensor";
import { ScrollDirection } from "./types";

export const BAR_SIZE = 6;

interface ScrollBarOptions extends CommonWidgetOptions {
  direction: ScrollDirection;
  onScroll(direction: ScrollDirection, delta: number): void;
}

export class ScrollBar extends SingleChildWidget<ScrollBarOptions> {
  public readonly name: string = "ScrollBar";
  public readonly customDrawing: boolean = true;

  protected isLooseBox: boolean = false;

  public barLength: number = 0;
  public barOffset: number = 0;
  public trackLength: number = 0;

  public constructor(options: ScrollBarOptions) {
    super(options);
  }

  public _Draw(ctx: CanvasRenderingContext2D) {
    const { direction } = this.options;

    ctx.fillStyle = "lightgrey";
    if (direction === "horizontal") {
      ctx.fillRect(0, 0, this.trackLength, BAR_SIZE);
    } else {
      ctx.fillRect(0, 0, BAR_SIZE, this.trackLength);
    }

    ctx.fillStyle = "grey";
    if (direction === "horizontal") {
      ctx.fillRect(this.barOffset, 0, this.barLength, BAR_SIZE);
    } else {
      ctx.fillRect(0, this.barOffset, BAR_SIZE, this.barLength);
    }
  }

  protected GetWidth(): Length {
    return 0;
  }

  protected GetHeight(): Length {
    return 0;
  }

  protected _Render(): WidgetElement {
    return new MouseSensor({});
  }
}

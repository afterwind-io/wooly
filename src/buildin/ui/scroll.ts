import { Widget } from "./foundation/widget";
import { Constraint } from "./common/constraint";
import { Size } from "./common/types";
import {
  SingleChildWidgetOptions,
  CommonWidgetOptions,
} from "./foundation/types";
import { Clamp } from "./common/utils";
import { CanvasComposition } from "../../core/canvasComposition";
import { NoChildWidget } from "./foundation/noChildWidget";
import { GetUniqId } from "../../util/idgen";
import { Vector2 } from "../../util/vector2";

export const enum ScrollOverflowBehavior {
  /**
   * No length constraints. If overflowed, show scroll bar.
   */
  Scroll,
  /**
   * No length constraints. If overflowed, clip the content.
   */
  Hidden,
  /**
   * The max length of the axis is constrained to the length of that axis of the
   * Scroll widget.
   */
  Limit,
}

interface ScrollOptions extends SingleChildWidgetOptions, CommonWidgetOptions {
  overflowH?: ScrollOverflowBehavior;
  overflowV?: ScrollOverflowBehavior;
}

export class Scroll extends Widget {
  public readonly name: string = "Scroll";

  public scrollH: number = 0;
  public scrollV: number = 0;

  private _hOverflowBehavior: ScrollOverflowBehavior;
  private _vOverflowBehavior: ScrollOverflowBehavior;

  private $composition: CanvasComposition;
  private $barH: ScrollBar;
  private $barV: ScrollBar;

  public constructor(options: ScrollOptions = {}) {
    super(options);

    const {
      child,
      overflowH = ScrollOverflowBehavior.Scroll,
      overflowV = ScrollOverflowBehavior.Scroll,
    } = options;
    this._hOverflowBehavior = overflowH;
    this._vOverflowBehavior = overflowV;

    this.AddChild((this.$composition = new CanvasComposition(GetUniqId())));
    if (child) {
      this.$composition.AddChild(child);
    }

    this.AddChild((this.$barH = new ScrollBar({ direction: "horizontal" })));
    this.AddChild((this.$barV = new ScrollBar({ direction: "vertical" })));
  }

  public _Ready() {
    window.addEventListener("wheel", this.onScroll);
  }

  public _Destroy() {
    window.removeEventListener("wheel", this.onScroll);
  }

  protected GetFirstChild(): Widget | null {
    const child = this.$composition["Child"] as Widget;
    return child || null;
  }

  protected _Render(): Widget | Widget[] | null {
    return this.childWidgets;
  }

  protected _Layout(constraint: Constraint): Size {
    const size = this._LayoutChild(constraint);
    this._LayoutBars();
    return size;
  }

  private _LayoutBars() {
    const child = this.GetFirstChild();
    if (!child) {
      return;
    }

    const clientWidth = this._intrinsicWidth;
    const clientHeight = this._intrinsicHeight;
    const scrollWidth = child._intrinsicWidth;
    const scrollHeight = child._intrinsicHeight;

    if (this._hOverflowBehavior === ScrollOverflowBehavior.Scroll) {
      this.$barH.enabled = true;

      this.$barH.barOffset = (this.scrollH * (clientWidth - 8)) / scrollWidth;
      this.$barH.barLength = (clientWidth * (clientWidth - 8)) / scrollWidth;
      this.$barH.trackLength = clientWidth - 8;
      this.$barH.position = new Vector2(0, clientHeight - 8);
    } else {
      this.$barH.enabled = false;
    }

    if (this._vOverflowBehavior === ScrollOverflowBehavior.Scroll) {
      this.$barV.enabled = true;

      this.$barV.barOffset = (this.scrollV * (clientHeight - 8)) / scrollHeight;
      this.$barV.barLength = (clientHeight * (clientHeight - 8)) / scrollHeight;
      this.$barV.trackLength = clientHeight - 8;
      this.$barV.position = new Vector2(clientWidth - 8, 0);
    } else {
      this.$barV.enabled = false;
    }
  }

  private _LayoutChild(constraint: Constraint): Size {
    const desiredWidth = this.width;
    const desiredHeight = this.height;

    const child = this.GetFirstChild();
    if (!child) {
      // FIXME
      return { width: 1, height: 1 };
    }

    const localConstraint = constraint.constrain(
      true,
      desiredWidth,
      desiredHeight
    );
    const maxWidth = this.getLengthLimitByBehavior(
      localConstraint.maxWidth,
      this._hOverflowBehavior
    );
    const maxHeight = this.getLengthLimitByBehavior(
      localConstraint.maxHeight,
      this._vOverflowBehavior
    );
    const childConstraint = new Constraint({
      maxWidth,
      maxHeight,
    });

    const childSize = child.$Layout(childConstraint);
    child.position = new Vector2(-this.scrollH, -this.scrollV);

    let width = 0;
    if (desiredWidth === "shrink") {
      width = childSize.width;
    } else if (desiredWidth === "stretch") {
      width = constraint.maxWidth;
    } else {
      width = Clamp(desiredWidth, constraint.minWidth, constraint.maxWidth);
    }

    let height = 0;
    if (desiredHeight === "shrink") {
      height = childSize.height;
    } else if (desiredHeight === "stretch") {
      height = constraint.maxHeight;
    } else {
      height = Clamp(desiredHeight, constraint.minHeight, constraint.maxHeight);
    }

    this._intrinsicWidth = width;
    this.w = width;

    this._intrinsicHeight = height;
    this.h = height;

    this.$composition.SetSize(new Vector2(width, height));

    return { width, height };
  }

  private getLengthLimitByBehavior(
    desiredLength: number,
    behavior: ScrollOverflowBehavior
  ): number {
    switch (behavior) {
      case ScrollOverflowBehavior.Scroll:
        return Infinity;
      case ScrollOverflowBehavior.Hidden:
        return Infinity;
      case ScrollOverflowBehavior.Limit:
        return desiredLength;
    }
  }

  private onScroll = (event: WheelEvent) => {
    if (!this.HitTest()) {
      return;
    }

    const child = this.GetFirstChild();
    if (!child) {
      return;
    }

    const clientHeight = this._intrinsicHeight;
    const clientWidth = this._intrinsicWidth;
    const scrollHeight = child._intrinsicHeight;
    const scrollWidth = child._intrinsicWidth;

    const deltaH = event.deltaX;
    const deltaY = event.deltaY;

    if (this._vOverflowBehavior === ScrollOverflowBehavior.Scroll) {
      this.scrollV = Clamp(
        this.scrollV + deltaY,
        0,
        scrollHeight - clientHeight
      );
    }
    if (this._hOverflowBehavior === ScrollOverflowBehavior.Scroll) {
      this.scrollH = Clamp(this.scrollH + deltaH, 0, scrollWidth - clientWidth);
    }
  };
}

interface ScrollBarOptions {
  direction: "horizontal" | "vertical";
  width?: number;
}

class ScrollBar extends NoChildWidget {
  public readonly name: string = "ScrollBar";

  public barLength: number = 0;
  public barOffset: number = 0;
  public trackLength: number = 0;

  private _direction: "horizontal" | "vertical";
  private _barWidth: number;

  public constructor(options: ScrollBarOptions) {
    super({});

    const { direction, width = 8 } = options;
    this._direction = direction;
    this._barWidth = width;
  }

  public _Draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "lightgrey";
    if (this._direction === "horizontal") {
      ctx.fillRect(0, 0, this.trackLength, this._barWidth);
    } else {
      ctx.fillRect(0, 0, this._barWidth, this.trackLength);
    }

    ctx.fillStyle = "grey";
    if (this._direction === "horizontal") {
      ctx.fillRect(this.barOffset, 0, this.barLength, this._barWidth);
    } else {
      ctx.fillRect(0, this.barOffset, this._barWidth, this.barLength);
    }
  }

  public _Layout(constraint: Constraint): Size {
    return { width: 0, height: 0 };
  }
}

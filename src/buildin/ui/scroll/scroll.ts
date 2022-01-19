import { Widget } from "../foundation/widget";
import { Constraint } from "../common/constraint";
import { Size } from "../common/types";
import {
  SingleChildWidgetOptions,
  CommonWidgetOptions,
  SizableWidgetOptions,
  WidgetElement,
} from "../foundation/types";
import { Clamp, GetLocalLength } from "../common/utils";
import { CanvasComposition } from "../../../core/canvasComposition";
import { GetUniqId } from "../../../util/idgen";
import { Vector2 } from "../../../util/vector2";
import { Node } from "../../../core/node";
import { BindThis } from "../foundation/decorator";
import { CreateWidgetRef, WidgetRefObject } from "../foundation/ref";
import { ScrollDirection } from "./types";
import { BAR_SIZE, ScrollBar } from "./scrollBar";

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

type BaseOptions = CommonWidgetOptions &
  SingleChildWidgetOptions &
  SizableWidgetOptions;

interface ScrollOptions extends BaseOptions {
  overflowH?: ScrollOverflowBehavior;
  overflowV?: ScrollOverflowBehavior;
}

export class Scroll extends Widget<ScrollOptions> {
  public readonly name: string = "Scroll";

  private $composition: CanvasComposition;
  private $refBarH: WidgetRefObject<ScrollBar>;
  private $refBarV: WidgetRefObject<ScrollBar>;
  private scrollH: number = 0;
  private scrollV: number = 0;

  public constructor(options: ScrollOptions) {
    super(options);

    this.$refBarH = CreateWidgetRef();
    this.$refBarV = CreateWidgetRef();

    this.$composition = new CanvasComposition(GetUniqId());
    super.AddChild(this.$composition);
  }

  public _Ready() {
    window.addEventListener("wheel", this.OnWheel);
  }

  public _Destroy() {
    window.removeEventListener("wheel", this.OnWheel);
  }

  /**
   * @override
   */
  public AddChild(node: Node): void {
    this.$composition.AddChild(node);
  }

  /**
   * @override
   */
  public InsertChild(child: Node, anchor: Node): void {
    this.$composition.InsertChild(child, anchor);
  }

  /**
   * @override
   */
  public RemoveChild(item: Node): void {
    this.$composition.RemoveChild(item);
  }

  protected _Render(): WidgetElement {
    return [
      this.options.child,
      new ScrollBar({
        ref: this.$refBarV,
        direction: "vertical",
        onScroll: this.OnScroll,
      }),
      new ScrollBar({
        ref: this.$refBarH,
        direction: "horizontal",
        onScroll: this.OnScroll,
      }),
    ];
  }

  protected _Layout(constraint: Constraint): Size {
    const size = this._LayoutChild(constraint);

    const { width, height } = size;
    this._intrinsicWidth = width;
    this._intrinsicHeight = height;
    this.$composition.SetSize(new Vector2(width, height));

    this._LayoutBars();

    return size;
  }

  private _LayoutBars(deltaH: number = 0, deltaV: number = 0) {
    // FIXME 应该常规layout滚动条，否则MouseSensor大小无法确定
    // TODO 滚动条应该有个最小高/宽度，否则无法拖动

    const child = this.GetFirstChild();
    if (!child) {
      return;
    }

    const $barH = this.$refBarH.current;
    const $barV = this.$refBarV.current;
    if (!$barH || !$barV) {
      return;
    }

    const clientWidth = this._intrinsicWidth;
    const clientHeight = this._intrinsicHeight;
    const scrollWidth = child._intrinsicWidth;
    const scrollHeight = child._intrinsicHeight;

    const { overflowH, overflowV } = this.options as Required<ScrollOptions>;
    if (overflowV === ScrollOverflowBehavior.Scroll) {
      const delta = scrollHeight - clientHeight;
      this.scrollV = delta < 0 ? 0 : Clamp(this.scrollV + deltaV, 0, delta);
    }
    if (overflowH === ScrollOverflowBehavior.Scroll) {
      const delta = scrollWidth - clientWidth;
      this.scrollH = delta < 0 ? 0 : Clamp(this.scrollH + deltaH, 0, delta);
    }

    const shouldEnableBarH =
      overflowH === ScrollOverflowBehavior.Scroll && //
      scrollWidth > clientWidth;
    const shouldEnableBarV =
      overflowV === ScrollOverflowBehavior.Scroll && //
      scrollHeight > clientHeight;

    $barH.enabled = shouldEnableBarH;
    if (shouldEnableBarH) {
      const gap = shouldEnableBarV ? BAR_SIZE : 0;

      $barH.barOffset = (this.scrollH * (clientWidth - gap)) / scrollWidth;
      $barH.barLength = (clientWidth * (clientWidth - gap)) / scrollWidth;
      $barH.trackLength = clientWidth - gap;
      $barH.position = new Vector2(0, clientHeight - BAR_SIZE);
    }

    $barV.enabled = shouldEnableBarV;
    if (shouldEnableBarV) {
      const gap = shouldEnableBarH ? BAR_SIZE : 0;

      $barV.barOffset = (this.scrollV * (clientHeight - gap)) / scrollHeight;
      $barV.barLength = (clientHeight * (clientHeight - gap)) / scrollHeight;
      $barV.trackLength = clientHeight - gap;
      $barV.position = new Vector2(clientWidth - BAR_SIZE, 0);
    }
  }

  private _LayoutChild(constraint: Constraint): Size {
    const {
      width: desiredWidth,
      height: desiredHeight,
      overflowH,
      overflowV,
    } = this.options as Required<ScrollOptions>;

    const child = this.GetFirstChild();
    if (!child) {
      return { width: 0, height: 0 };
    }

    const localConstraint = constraint.constrain(
      true,
      desiredWidth,
      desiredHeight
    );
    const maxWidth = this.getLengthLimitByBehavior(
      localConstraint.maxWidth,
      overflowH
    );
    const maxHeight = this.getLengthLimitByBehavior(
      localConstraint.maxHeight,
      overflowV
    );
    const childConstraint = new Constraint({
      maxWidth,
      maxHeight,
    });

    const childSize = child.$Layout(childConstraint);
    child.position = new Vector2(-this.scrollH, -this.scrollV);

    const width = GetLocalLength(
      constraint.minWidth,
      constraint.maxWidth,
      desiredWidth,
      childSize.width
    );
    const height = GetLocalLength(
      constraint.minHeight,
      constraint.maxHeight,
      desiredHeight,
      childSize.height
    );

    return { width, height };
  }

  /**
   * @override
   */
  protected GetFirstChild(): Widget | null {
    const child = this.$composition.child as Widget;
    return child || null;
  }

  /**
   * @override
   */
  protected NormalizeOptions(options: ScrollOptions): ScrollOptions {
    return {
      width: "stretch",
      height: "stretch",
      overflowH: ScrollOverflowBehavior.Scroll,
      overflowV: ScrollOverflowBehavior.Scroll,
      ...options,
    };
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

  @BindThis
  private OnScroll(direction: ScrollDirection, delta: number): void {
    // TODO drag'n'drop event
  }

  @BindThis
  private OnWheel(event: WheelEvent): void {
    if (!this.HitTest(this._intrinsicWidth, this._intrinsicHeight)) {
      return;
    }

    const child = this.GetFirstChild();
    if (!child) {
      return;
    }

    const deltaH = event.deltaX;
    const deltaV = event.deltaY;

    this._LayoutBars(deltaH, deltaV);

    // 滚动位置发生变化不会变更自身及子代的layout，只会变更直接子代的位置
    // 因此跳过常规layout流程，直接对直接子代进行位置重排
    child.position = new Vector2(-this.scrollH, -this.scrollV);
  }
}

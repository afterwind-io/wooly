import { OneTimeCachedGetter } from "../util/cachedGetter";
import { GlobalComputedProperty } from "../util/globalComputedProperty";
import { CanvasComposition } from "./canvasComposition";
import { CanvasLayer } from "./canvasLayer";
import { Transform } from "./transform";
import { Node } from "./node";

/**
 * Base class of everything relates to drawing.
 */
export abstract class CanvasItem extends Transform {
  /**
   * Indicate whether to enable custom drawing.
   *
   * In other words, if you need to override the `_Draw` method,
   * remember setting this flag to `true`.
   *
   * @example
   * ```typescript
   * export class MyEntity extends Entity {
   *   // Directly declare a property...
   *   public readonly customDrawing: boolean = true;
   *
   *   public _Ready() {
   *     // ...**Or** do it here ...
   *     this.customDrawing = true;
   *   }
   *
   *   public _Draw(ctx: CanvasRenderingContext2D) {
   *     // ...If you need some custom drawing
   *
   *     // blahblah...
   *   }
   * }
   * ```
   *
   * @type {boolean}
   * @memberof CanvasItem
   */
  public customDrawing: boolean = false;

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * The pointer to the parent node.
   */
  protected parent: CanvasItem | CanvasLayer | CanvasComposition | null = null;

  private _opacity: GlobalOpacity = new GlobalOpacity(this, 1);
  private _visible: GlobalVisible = new GlobalVisible(this, true);
  private _zIndex: GlobalZIndex = new GlobalZIndex(this, 0);

  /**
   * The local transparency of the current node.
   */
  public get opacity(): number {
    return this._opacity.local;
  }
  public set opacity(value: number) {
    this._opacity.local = value;
  }

  /**
   * A flag indicates the visibility of the Entity.
   *
   * When set to `false`, the `_Draw` cycle of the entity and its descendants
   * is skipped, but they still get updated.
   */
  public get visible(): boolean {
    return this._visible.local;
  }
  public set visible(value: boolean) {
    this._visible.local = value;
  }

  /**
   * The value indicates the rendering order, relative to parent.
   *
   * When nodes are overlapping with each others,
   * the node with higher value will be drawn "later",
   * thus appears in front of those with lower value.
   *
   * Note that in the `Draw` phase, the actual value taken into calculation
   * is the `GlobalZIndex`, which means then final drawing order is affected
   * by its parent. Details see the explanation of `GlobalZIndex`.
   *
   * Though it is not intended, you can set local `zIndex` to a minus value.
   * In this way you can "hide" the node behind the parent.
   */
  public get zIndex(): number {
    return this._zIndex.local;
  }
  public set zIndex(value: number) {
    this._zIndex.local = value;
  }

  /**
   * Get the canvas layer the node currently at.
   *
   * @type {CanvasLayer}
   * @memberof CanvasItem
   */
  @OneTimeCachedGetter
  public get globalLayer(): number {
    let layer = 0;

    this.Bubble((node) => {
      if (node instanceof CanvasComposition) {
        return true;
      }

      if (node instanceof CanvasLayer) {
        layer = node.index;
        return true;
      }
    });

    return layer;
  }

  /**
   * Get the composition the node currently at.
   */
  @OneTimeCachedGetter
  public get globalComposition(): number {
    let composition = 0;

    this.Bubble((node) => {
      if (node instanceof CanvasComposition) {
        composition = node.index;
        return true;
      }
    });

    return composition;
  }

  /**
   * Get the total transparency of the current node.
   *
   * This is decided by both local value and the global value from the parent,
   * and calculated as `[local] * [global from parent]`.
   */
  public get globalOpacity(): number {
    return this._opacity.global;
  }

  /**
   * Check the visibility of the node itself and its ancestor.
   *
   * If any of them is `false`, then the node is invisible, and vice versa.
   */
  public get globalVisible(): boolean {
    return this._visible.global;
  }

  /**
   * The actual zIndex.
   *
   * It is calculated accumulatively from root through the ancestors.
   * For example, if the `zIndex` of root is 0, grandparent is 1, parent
   * is 2, local zIndex is 3, then the final value is 6.
   *
   * @readonly
   * @type {number}
   * @memberof CanvasItem
   */
  public get globalZIndex(): number {
    return this._zIndex.global;
  }

  /**
   * Set the local zIndex relative to parent.
   *
   * @param {number} zIndex The zIndex.
   * @returns {this} This instance of the entity.
   * @memberof CanvasItem
   */
  public SetZIndex(zIndex: number): this {
    return (this.zIndex = zIndex), this;
  }

  /**
   * Set the visibility of the entity.
   *
   * @param {boolean} f The flag.
   * @returns {this} This instance of the entity.
   * @memberof CanvasItem
   */
  public SetVisible(f: boolean): this {
    return (this.visible = f), this;
  }

  /**
   * [**Lifecycle**]
   * Called on every draw updates, after the `_Update` call.
   *
   * @public
   * @param {CanvasRenderingContext2D} ctx
   * The `CanvasRenderingContext2D` interface.
   * @memberof CanvasItem
   */
  public _Draw(ctx: CanvasRenderingContext2D) {}
}

class GlobalOpacity extends GlobalComputedProperty<CanvasItem, number> {
  public ComputeGlobalValue(): number {
    // @ts-expect-error TS2445 protected property
    const parent = this.host.parent;

    if (!parent) {
      return this.local;
    }

    if (parent instanceof CanvasLayer) {
      return 1;
    }

    return this.local * parent.globalOpacity;
  }

  public GetPropertyInstance(
    node: Node
  ): GlobalComputedProperty<CanvasItem, number> | null {
    if (node instanceof CanvasItem) {
      // @ts-expect-error TS2341 private property
      return node._opacity;
    }

    return null;
  }
}

class GlobalVisible extends GlobalComputedProperty<CanvasItem, boolean> {
  public ComputeGlobalValue(): boolean {
    // @ts-expect-error TS2445 protected property
    const parent = this.host.parent;

    if (!parent) {
      return this.local;
    }

    if (parent instanceof CanvasLayer) {
      return true;
    }

    return this.local && parent.globalVisible;
  }

  public GetPropertyInstance(
    node: Node
  ): GlobalComputedProperty<CanvasItem, boolean> | null {
    if (node instanceof CanvasItem) {
      // @ts-expect-error TS2341 private property
      return node._visible;
    }

    return null;
  }
}

class GlobalZIndex extends GlobalComputedProperty<CanvasItem, number> {
  public ComputeGlobalValue(): number {
    // @ts-expect-error TS2445 protected property
    const parent = this.host.parent;

    if (!parent) {
      return this.local;
    }

    if (parent instanceof CanvasLayer) {
      return 0;
    }

    return this.local + parent.globalZIndex;
  }

  public GetPropertyInstance(
    node: Node
  ): GlobalComputedProperty<CanvasItem, number> | null {
    if (node instanceof CanvasItem) {
      // @ts-expect-error private `_zIndex`
      return node._zIndex;
    }

    return null;
  }
}

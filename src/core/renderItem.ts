import { CanvasComposition } from "./canvasComposition";
import { CanvasLayer } from "./canvasLayer";
import { Transform } from "./transform";

/**
 * Base class of everything relates to drawing.
 *
 * @export
 * @abstract
 * @class RenderItem
 * @extends {Node}
 */
export abstract class RenderItem extends Transform {
  /**
   * A flag indicates the visibility of the Entity.
   *
   * When set to `false`, the `_Draw` cycle of the entity and its descendants
   * is skipped, but they still get updated.
   *
   * @type {boolean}
   * @memberof RenderItem
   */
  public visible: boolean = true;

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
   *
   * @type {number}
   * @memberof RenderItem
   */
  public zIndex: number = 0;

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
   * @memberof RenderItem
   */
  public customDrawing: boolean = false;

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * A Flag indicates whether the node is freezed.
   *
   * @protected
   * @type {boolean}
   * @memberof RenderItem
   */
  protected isFreezed: boolean = false;

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * The pointer to the parent node.
   *
   * @protected
   * @type {(RenderItem | null)}
   * @memberof RenderItem
   */
  protected parent: RenderItem | null = null;

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * The cache value of `GlobalZIndex`.
   *
   * @private
   * @type {number}
   * @memberof RenderItem
   */
  private $freezedGlobalZIndex: number = 0;

  /**
   * [**Internal**]
   * **Do not modify this manually**
   * 
   * The cache value of `globalLayer`.
   */
  private $cachedGlobalLayer: number = -1;

  /**
   * [**Internal**]
   * **Do not modify this manually**
   * 
   * The cache value of `globalComposition`.
   */
  private $cachedGlobalComposition: number = -1;

  /**
   * Get the canvas layer the node currently at.
   *
   * @type {CanvasLayer}
   * @memberof RenderItem
   */
  public get globalLayer(): number {
    let layer = this.$cachedGlobalLayer;

    if (layer !== -1) {
      return layer;
    }

    layer = 0;
    this.Bubble((node) => {
      if (node instanceof CanvasLayer) {
        layer = node.index;
        return true;
      }
    });

    this.$cachedGlobalLayer = layer;
    return layer;
  }

  /**
   * Get the composition the node currently at.
   */
  public get globalComposition(): number {
    let composition = this.$cachedGlobalComposition;

    if (composition !== -1) {
      return composition;
    }

    composition = 0;
    this.Bubble((node) => {
      if (node instanceof CanvasComposition) {
        composition = node.index;
        return true;
      }
    });

    this.$cachedGlobalComposition = composition;
    return composition;
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
   * @memberof RenderItem
   */
  public get GlobalZIndex(): number {
    if (this.isFreezed) {
      return this.$freezedGlobalZIndex;
    }

    if (!(this.parent instanceof RenderItem)) {
      return this.zIndex;
    } else {
      return this.parent.GlobalZIndex + this.zIndex;
    }
  }

  /**
   * [**Internal**]
   * **Do not call this manually**
   *
   * Immediately calculate the value of global attributes,
   * and store them to the local properties.
   *
   * It is usually called right before `Draw` phase, to prevent
   * duplicate calculations. This "snapshot" should be safe, because
   * no entity property manipulation should present in the `Draw` phase,
   * thus all values are fixed already.
   *
   * @memberof RenderItem
   */
  public $Freeze() {
    this.$freezedGlobalZIndex = this.GlobalZIndex;

    this.isFreezed = true;
  }

  /**
   * [**Internal**]
   * **Do not call this manually**
   *
   * Rewind the freeze state.
   *
   * @memberof RenderItem
   */
  public $Melt() {
    this.isFreezed = false;
  }

  /**
   * Set the local zIndex relative to parent.
   *
   * @param {number} zIndex The zIndex.
   * @returns {this} This instance of the entity.
   * @memberof RenderItem
   */
  public SetZIndex(zIndex: number): this {
    return (this.zIndex = zIndex), this;
  }

  /**
   * Set the visibility of the entity.
   *
   * @param {boolean} f The flag.
   * @returns {this} This instance of the entity.
   * @memberof RenderItem
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
   * @memberof RenderItem
   */
  public _Draw(ctx: CanvasRenderingContext2D) {}
}

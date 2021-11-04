import { Node } from './node';
import { Vector2 } from '../util/vector2';
import { CompositionManager } from './manager/composition';

/**
 * Base class of everything relates to drawing.
 *
 * @export
 * @abstract
 * @class RenderItem
 * @extends {Node}
 */
export abstract class RenderItem extends Node {
  public composition: boolean = false;

  /**
   * The height of the node.
   *
   * @type {number}
   * @memberof RenderItem
   */
  public h: number = 0;

  /**
   * Set or create the canvas layer the node currently at.
   *
   * @type {number}
   * @memberof RenderItem
   */
  public layer: number = 0;

  /**
   * The local position relative to parent.
   *
   * @type {Vector2}
   * @memberof RenderItem
   */
  public position: Vector2 = new Vector2();

  /**
   * The local rotation in radians relative to parent.
   *
   * @type {number}
   * @memberof RenderItem
   */
  public rotation: number = 0;

  /**
   * The local scale relative to parent.
   *
   * @type {Vector2}
   * @memberof RenderItem
   */
  public scale: Vector2 = new Vector2(1, 1);

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
   * The width of the node.
   *
   * @type {number}
   * @memberof RenderItem
   */
  public w: number = 0;

  /**
   * The value indicates the rendering order, relative to parant.
   *
   * When nodes are overlapping with each others,
   * the node with higher value will be drawed "later",
   * thus appears in front of those with lower value.
   *
   * Note that in the `Draw` phase, the actual value taken into calculation
   * is the `GlobalZIndex`, which means then final drawing order is affected
   * by its parent. Details see the explaination of `GlobalZIndex`.
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
  protected customDrawing: boolean = false;

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
   * The cache value of `GlobalLayer`.
   *
   * @private
   * @type {number}
   * @memberof RenderItem
   */
  private $freezedGlobalLayer: number = 0;

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * The cache value of `GlobalPosition`.
   *
   * @private
   * @type {Vector2}
   * @memberof RenderItem
   */
  private $freezedCompositionPosition: Vector2 = new Vector2();

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * The cache value of `GlobalRotation`.
   *
   * @private
   * @type {number}
   * @memberof RenderItem
   */
  private $freezedCompositionRotation: number = 0;

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * The cache value of `GlobalScale`.
   *
   * @private
   * @type {Vector2}
   * @memberof RenderItem
   */
  private $freezedCompositionScale: Vector2 = new Vector2(1, 1);

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

  public get CompositionPosition(): Vector2 {
    if (this.isFreezed) {
      return this.$freezedCompositionPosition;
    }

    if (!this.parent) {
      return this.position;
    } else if (this.composition) {
      return new Vector2();
    } else {
      return this.position
        .Dot(this.parent.GlobalScale)
        .Rotate(this.parent.CompositionRotation)
        .Add(this.parent.CompositionPosition);
    }
  }

  public get CompositionRotation(): number {
    if (this.isFreezed) {
      return this.$freezedCompositionRotation;
    }

    if (!this.parent) {
      return this.rotation;
    } else if (this.composition) {
      return 0;
    } else {
      return this.rotation + this.parent.CompositionRotation;
    }
  }

  public get CompositionScale(): Vector2 {
    if (this.isFreezed) {
      return this.$freezedCompositionScale;
    }

    if (!this.parent) {
      return this.scale;
    } else if (this.composition) {
      return new Vector2(1, 1);
    } else {
      return this.scale.Dot(this.parent.CompositionScale);
    }
  }

  /**
   * The actual layer on screen.
   *
   * @readonly
   * @type {number}
   * @memberof RenderItem
   */
  public get GlobalLayer(): number {
    if (this.isFreezed) {
      return this.$freezedGlobalLayer;
    }

    if (this.layer !== 0) {
      return this.layer;
    }

    if (this.parent) {
      return this.parent.GlobalLayer;
    }

    return 0;
  }

  /**
   * The actual position on screen.
   *
   * @readonly
   * @type {Vector2}
   * @memberof RenderItem
   */
  public get GlobalPosition(): Vector2 {
    if (!this.parent) {
      return this.position;
    } else {
      return this.position
        .Dot(this.parent.GlobalScale)
        .Rotate(this.parent.GlobalRotation)
        .Add(this.parent.GlobalPosition);
    }
  }

  /**
   * The actual rotation on screen, in radians.
   *
   * @readonly
   * @type {number}
   * @memberof RenderItem
   */
  public get GlobalRotation(): number {
    if (!this.parent) {
      return this.rotation;
    } else {
      return this.rotation + this.parent.GlobalRotation;
    }
  }

  /**
   * The acutal scale on screen.
   *
   * @readonly
   * @type {Vector2}
   * @memberof RenderItem
   */
  public get GlobalScale(): Vector2 {
    if (!this.parent) {
      return this.scale;
    } else {
      return this.scale.Dot(this.parent.GlobalScale);
    }
  }

  /**
   * The actual zIndex.
   *
   * It is calculated accumulatively from root through the ancestors.
   * For example, if the `zIndex` of root is 0, grandparant is 1, parent
   * is 2, local zIndex is 3, then the final value is 6.
   *
   * @readonly
   * @type {number}
   * @memberof RenderItem
   */
  public get GlobalZIndex(): number {
    if (this.parent == null) {
      return this.zIndex;
    } else {
      return this.parent.GlobalZIndex + this.zIndex;
    }
  }

  /**
   * [**Internal**]
   * **Do not call this manually**
   *
   * Trigger the draw process.
   *
   * @param {CanvasRenderingContext2D} ctx
   * The `CanvasRenderingContext2D` interface.
   * @returns
   * @memberof RenderItem
   */
  public $Draw(ctx: CanvasRenderingContext2D) {
    if (!this.enabled) {
      return;
    }

    // FIXME 子代不知道祖先节点是否设置了visible
    if (!this.visible) {
      return;
    }

    if (!this.customDrawing) {
      return;
    }

    this._Draw(ctx);
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
    this.$freezedGlobalLayer = this.GlobalLayer;
    this.$freezedCompositionPosition = this.CompositionPosition;
    this.$freezedCompositionRotation = this.CompositionRotation;
    this.$freezedCompositionScale = this.CompositionScale;
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
   * Rotate the node based on current ratation.
   *
   * @param {number} rad The angle in radians.
   * @memberof RenderItem
   */
  public Rotate(rad: number) {
    this.rotation += rad;
  }

  /**
   * Scale the node based on current scale.
   *
   * @param {number} scaleX The scale factor along x-axis.
   * @param {number} [scaleY=scaleX]
   * The scale factor along y-axis.
   * If not given, the value will be considered equal to `scaleX`.
   * @memberof RenderItem
   */
  public Scale(scaleX: number, scaleY: number = scaleX) {
    this.scale.x = this.scale.x * scaleX;
    this.scale.y = this.scale.y * scaleY;
  }

  /**
   * Set the layer of the node.
   *
   * @param {number} layer The index of the layer.
   * @returns {this} This instance of the node.
   * @memberof RenderItem
   */
  public SetLayer(layer: number): this {
    return (this.layer = layer), this;
  }

  /**
   * Set the local position relative to parent by vector.
   *
   * @param {Vector2} pos Local position vector.
   * @returns {this}
   * @memberof RenderItem
   */
  public SetPosition(pos: Vector2): this;
  /**
   * Set the local position by specified value.
   *
   * @param {number} x The position on the x-axis.
   * @param {number} y The position on the y-axis.
   * @returns {this} This instance of the entity.
   * @memberof RenderItem
   */
  public SetPosition(x: number, y: number): this;
  public SetPosition(p1: number | Vector2, p2?: number) {
    let pos: Vector2;
    if (p1 instanceof Vector2) {
      pos = p1;
    } else {
      pos = new Vector2(p1, p2);
    }
    return (this.position = pos), this;
  }

  /**
   * Set the local rotation relative to parent by radians.
   *
   * @param {number} rad The angle, in radians.
   * @returns {this} This instance of the entity.
   * @memberof RenderItem
   */
  public SetRotation(rad: number): this {
    return (this.rotation = rad), this;
  }

  /**
   * Set the local scale relative to parent by vector.
   *
   * @param {Vector2} scale The scale vector.
   * @returns {this} This instance of the entity.
   * @memberof RenderItem
   */
  public SetScale(scale: Vector2): this;
  /**
   * Set the local scale relative to parent
   * by specific factor along x-axis and y-aixs.
   *
   * @param {number} scaleX The scale factor along x-axis.
   * @param {number} [scaleY]
   * The scale factor along y-axis.
   * If not given, the value will be considered equal to `scaleX`.
   * @returns {this} This instance of the entity.
   * @memberof RenderItem
   */
  public SetScale(scaleX: number, scaleY?: number): this;
  public SetScale(p1: Vector2 | number, p2?: number): this {
    if (p1 instanceof Vector2) {
      this.scale = p1;
    } else {
      if (p2 === void 0) {
        p2 = p1;
      }

      this.scale = new Vector2(p1, p2);
    }

    return this;
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
   * Set the visiblity of the entity.
   *
   * @param {boolean} f The flag.
   * @returns {this} This instance of the entity.
   * @memberof RenderItem
   */
  public SetVisible(f: boolean): this {
    return (this.visible = f), this;
  }

  /**
   * Translate the entity by vector.
   *
   * @param {Vector2} v The offset vector.
   * @memberof RenderItem
   */
  public Translate(v: Vector2): void;
  /**
   * Translate the entity by specified value.
   *
   * @param {number} x The offset along x-axis.
   * @param {number} y The offset along y-axis.
   * @memberof RenderItem
   */
  public Translate(x: number, y: number): void;
  public Translate(p1: number | Vector2, p2?: number) {
    let delta: Vector2;
    if (p1 instanceof Vector2) {
      delta = p1;
    } else {
      delta = new Vector2(p1, p2);
    }

    this.position = this.position.Add(delta);
  }

  protected $SelfDestroy() {
    super.$SelfDestroy();

    if (this.composition) {
      CompositionManager.ReleaseComposition(this.id);
    }
  }

  /**
   * [**Lifecycle**]
   * Called on every draw updates, after the `_Update` call.
   *
   * @protected
   * @param {CanvasRenderingContext2D} ctx
   * The `CanvasRenderingContext2D` interface.
   * @memberof RenderItem
   */
  protected _Draw(ctx: CanvasRenderingContext2D) {}
}

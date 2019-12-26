import { Node } from "./node";
import { Viewport } from "./viewport";
import { GetTransformMatrix } from "../util/common";
import { Vector2 } from "../util/vector2";

/**
 * Base class of everything relates to drawing.
 *
 * @export
 * @abstract
 * @class CanvasTreeItem
 * @extends {Node}
 */
export abstract class CanvasTreeItem extends Node {
  /**
   * The local position relative to parent.
   *
   * @type {Vector2}
   * @memberof CanvasTreeItem
   */
  public position: Vector2 = new Vector2();

  /**
   * The local rotation in radians relative to parent.
   *
   * @type {number}
   * @memberof CanvasTreeItem
   */
  public rotation: number = 0;

  /**
   * The local scale relative to parent.
   *
   * @type {Vector2}
   * @memberof CanvasTreeItem
   */
  public scale: Vector2 = new Vector2(1, 1);

  /**
   * A flag indicates the visibility of the Entity.
   *
   * When set to `false`, the `_Draw` cycle of the entity and its descendants
   * is skipped, but they still get updated.
   *
   * @type {boolean}
   * @memberof CanvasTreeItem
   */
  public visible: boolean = true;

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
   * @memberof CanvasTreeItem
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
   * @memberof CanvasTreeItem
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
   * @memberof CanvasTreeItem
   */
  protected isFreezed: boolean = false;

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * The pointer to the parent node.
   *
   * @protected
   * @type {(CanvasTreeItem | null)}
   * @memberof CanvasTreeItem
   */
  protected parent: CanvasTreeItem | null = null;

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * The cache value of `GlobalPosition`.
   *
   * @private
   * @type {Vector2}
   * @memberof CanvasTreeItem
   */
  private $freezedGlobalPosition: Vector2 = new Vector2();

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * The cache value of `GlobalRotation`.
   *
   * @private
   * @type {number}
   * @memberof CanvasTreeItem
   */
  private $freezedGlobalRotation: number = 0;

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * The cache value of `GlobalScale`.
   *
   * @private
   * @type {Vector2}
   * @memberof CanvasTreeItem
   */
  private $freezedGlobalScale: Vector2 = new Vector2(1, 1);

  /**
   * [**Internal**]
   * **Do not modify this manually**
   *
   * The cache value of `GlobalZIndex`.
   *
   * @private
   * @type {number}
   * @memberof CanvasTreeItem
   */
  private $freezedGlobalZIndex: number = 0;

  /**
   * The actual position on screen.
   *
   * @readonly
   * @type {Vector2}
   * @memberof CanvasTreeItem
   */
  public get GlobalPosition(): Vector2 {
    if (this.isFreezed) {
      return this.$freezedGlobalPosition;
    }

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
   * @memberof CanvasTreeItem
   */
  public get GlobalRotation(): number {
    if (this.isFreezed) {
      return this.$freezedGlobalRotation;
    }

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
   * @memberof CanvasTreeItem
   */
  public get GlobalScale(): Vector2 {
    if (this.isFreezed) {
      return this.$freezedGlobalScale;
    }

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
   * @memberof CanvasTreeItem
   */
  public get GlobalZIndex(): number {
    if (this.isFreezed) {
      return this.$freezedGlobalZIndex;
    }

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
   * @memberof CanvasTreeItem
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

    ctx.save();

    const viewportOrigin = Viewport.Current.Origin;
    const viewportRotation = Viewport.Current.Rotation;

    const position = this.GlobalPosition.Substract(viewportOrigin).Rotate(
      -viewportRotation
    );
    const rotation = this.GlobalRotation - viewportRotation;
    const scale = this.GlobalScale;
    ctx.transform(...GetTransformMatrix(position, rotation, scale));

    this._Draw(ctx);

    ctx.restore();
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
   * @memberof CanvasTreeItem
   */
  public $Freeze() {
    this.$freezedGlobalPosition = this.GlobalPosition;
    this.$freezedGlobalRotation = this.GlobalRotation;
    this.$freezedGlobalScale = this.GlobalScale;
    this.$freezedGlobalZIndex = this.GlobalZIndex;

    this.isFreezed = true;
  }

  /**
   * [**Internal**]
   * **Do not call this manually**
   *
   * Rewind the freeze state.
   *
   * @memberof CanvasTreeItem
   */
  public $Melt() {
    this.isFreezed = false;
  }

  /**
   * Rotate the node based on current ratation.
   *
   * @param {number} rad The angle in radians.
   * @memberof CanvasTreeItem
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
   * @memberof CanvasTreeItem
   */
  public Scale(scaleX: number, scaleY: number = scaleX) {
    this.scale.x = this.scale.x * scaleX;
    this.scale.y = this.scale.y * scaleY;
  }

  /**
   * Set the local position relative to parent by vector.
   *
   * @param {Vector2} pos Local position vector.
   * @returns {this}
   * @memberof CanvasTreeItem
   */
  public SetPosition(pos: Vector2): this;
  /**
   * Set the local position by specified value.
   *
   * @param {number} x The position on the x-axis.
   * @param {number} y The position on the y-axis.
   * @returns {this} This instance of the entity.
   * @memberof CanvasTreeItem
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
   * @memberof CanvasTreeItem
   */
  public SetRotation(rad: number): this {
    return (this.rotation = rad), this;
  }

  /**
   * Set the local scale relative to parent by vector.
   *
   * @param {Vector2} scale The scale vector.
   * @returns {this} This instance of the entity.
   * @memberof CanvasTreeItem
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
   * @memberof CanvasTreeItem
   */
  public SetScale(scaleX: number, scaleY?: number): this;
  public SetScale(p1: Vector2 | number, p2?: number): this {
    if (p1 instanceof Vector2) {
      this.scale = p1;
    } else if (p2 === void 0) {
      p2 = p1;
      this.scale = new Vector2(p1, p2);
    }

    return this;
  }

  /**
   * Set the local zIndex relative to parent.
   *
   * @param {number} zIndex The zIndex.
   * @returns {this} This instance of the entity.
   * @memberof CanvasTreeItem
   */
  public SetZIndex(zIndex: number): this {
    return (this.zIndex = zIndex), this;
  }

  /**
   * Set the visiblity of the entity.
   *
   * @param {boolean} f The flag.
   * @returns {this} This instance of the entity.
   * @memberof CanvasTreeItem
   */
  public SetVisible(f: boolean): this {
    return (this.visible = f), this;
  }

  /**
   * Translate the entity by vector.
   *
   * @param {Vector2} v The offset vector.
   * @memberof CanvasTreeItem
   */
  public Translate(v: Vector2): void;
  /**
   * Translate the entity by specified value.
   *
   * @param {number} x The offset along x-axis.
   * @param {number} y The offset along y-axis.
   * @memberof CanvasTreeItem
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

  /**
   * [**Lifecycle**]
   * Called on every draw updates, after the `_Update` call.
   *
   * @protected
   * @param {CanvasRenderingContext2D} ctx
   * The `CanvasRenderingContext2D` interface.
   * @memberof CanvasTreeItem
   */
  protected _Draw(ctx: CanvasRenderingContext2D) {}
}

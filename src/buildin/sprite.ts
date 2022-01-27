import { Entity } from "../core/entity";
import { Vector2 } from "../util/vector2";
import { ImageResource } from "./resource";

/**
 * An entity to display a static image.
 *
 * @export
 * @class Sprite
 * @extends {Entity}
 */
export class Sprite extends Entity {
  public readonly enableDrawing: boolean = true;
  public readonly name: string = "Sprite";

  public clipOrigin: Vector2 = new Vector2();
  public clipSize: Vector2 = new Vector2();
  public offset: Vector2 = new Vector2();

  protected image: HTMLImageElement = new Image();
  protected isFlipH: boolean = false;
  protected isFlipV: boolean = false;
  protected isSmoothImage: boolean = true;
  protected isCentered: boolean = false;

  /**
   * Creates an instance of Sprite.
   *
   * @param {ImageResource} imageSource An image source (usually `HTMLImageElement`) fetched by `ResourceManager`.
   * @memberof Sprite
   */
  public constructor(imageSource: ImageResource) {
    super();

    this.SetImage(imageSource);
  }

  public _Draw(ctx: CanvasRenderingContext2D) {
    const sx = this.clipOrigin.x;
    const sy = this.clipOrigin.y;
    const sw = this.clipSize.x || this.image.naturalWidth;
    const sh = this.clipSize.y || this.image.naturalHeight;

    const dx = this.isCentered ? -this.w / 2 : this.offset.x;
    const dy = this.isCentered ? -this.h / 2 : this.offset.y;
    const dw = this.w || sw;
    const dh = this.h || sh;

    const fh = this.isFlipH;
    const fv = this.isFlipV;
    if (fh || fv) {
      ctx.scale(fh ? -1 : 1, fv ? -1 : 1);
    }

    const ddx = fh ? -dx - dw : dx;
    const ddy = fv ? -dy - dh : dy;

    ctx.imageSmoothingEnabled = this.isSmoothImage;
    ctx.drawImage(this.image, sx, sy, sw, sh, ddx, ddy, dw, dh);
  }

  public _Destroy() {
    this.image = null!;
  }

  /**
   * Set the actual display region from the source image.
   *
   * You can **clip** a sub-rectangle from the source image, by specifying
   * a top-left starting point, and the width and height of the region.
   *
   * If the `sw` is not specified, the entire width from the `sx` to the right
   * will be applied. Also, if the `sh` is not specified, the entire height from
   * the `sy` to the bottom will be applied.
   *
   * @param {number} sx
   * The x-axis coordinate of the top left corner of the sub-rectangle of the source image;
   * @param {number} sy
   * The y-axis coordinate of the top left corner of the sub-rectangle of the source image;
   * @param {number} [sw=0]
   * The width of the sub-rectangle of the source image;
   * @param {number} [sh=0]
   * The height of the sub-rectangle of the source image;
   *
   * @returns {this}
   * @memberof Sprite
   */
  public SetClip(sx: number, sy: number, sw: number = 0, sh: number = 0): this {
    this.clipOrigin.x = sx;
    this.clipOrigin.y = sy;
    this.clipSize.x = sw;
    this.clipSize.y = sh;

    return this;
  }

  /**
   * Determine whether the image should be flipped horizontally.
   *
   * @param {boolean} f The flag. If `true`, the image flipped horizontally.
   * @returns {this} This instance of the `Sprite`.
   * @memberof Sprite
   */
  public SetFlipH(f: boolean): this {
    return (this.isFlipH = f), this;
  }

  /**
   * Determine whether the image should be flipped vertically.
   *
   * @param {boolean} f The flag. If `true`, the image flipped vertically.
   * @returns {this} This instance of the `Sprite`.
   * @memberof Sprite
   */
  public SetFlipV(f: boolean): this {
    return (this.isFlipV = f), this;
  }

  /**
   * Determine whether should center the texture.
   *
   * If set to `true`, the `offset` property will be ignored.
   *
   * @param {boolean} f The flag.
   * @returns {this}
   * @memberof Sprite
   */
  public SetIsCentered(f: boolean): this {
    return (this.isCentered = f), this;
  }

  /**
   * Set image path.
   *
   * @param {ImageResource} imageSource An image source (usually `HTMLImageElement`) fetched by `ResourceManager`.
   * @returns {this}
   * @memberof Sprite
   */
  public SetImage(imageSource: ImageResource): this {
    return (this.image = imageSource.container), this;
  }

  /**
   * Determine whether scaled images are smoothed.
   *
   * Controls the `imageSmoothingEnabled` property of `CanvasRenderingContext2D`.
   *
   * @param {boolean} f The flag.
   * @returns {this}
   * @memberof Sprite
   */
  public SetIsSmoothImage(f: boolean): this {
    return (this.isSmoothImage = f), this;
  }

  /**
   * Set the position offset of the texture.
   *
   * The `offset` only affects the actual render position of the texture.
   * It does not shift the position of the `Sprite` itself.
   *
   * @param {Vector2} o The offset vector.
   * @returns {this}
   * @memberof Sprite
   */
  public SetOffset(o: Vector2): this {
    return (this.offset = o), this;
  }
}

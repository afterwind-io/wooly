import { Entity } from "../core/entity";
import { Vector2 } from "../util/vector2";

export class Sprite extends Entity {
  public name: string = "Sprite";
  public offset: Vector2 = new Vector2();

  protected image: HTMLImageElement = new Image();
  protected isImageLoaded: boolean = false;
  protected isSmoothImage: boolean = true;
  protected isCentered: boolean = false;

  public constructor() {
    super();

    this.image.onload = this.onImageLoad.bind(this);
  }

  public _Draw(ctx: CanvasRenderingContext2D) {
    if (!this.isImageLoaded) {
      return;
    }

    const dx = this.isCentered ? -this.w / 2 : this.offset.x;
    const dy = this.isCentered ? -this.h / 2 : this.offset.y;

    ctx.imageSmoothingEnabled = this.isSmoothImage;
    ctx.drawImage(this.image, dx, dy, this.w, this.h);
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
   * @param {string} path Anything fits into DOM `Image.src` property.
   * @returns {this}
   * @memberof Sprite
   */
  public SetImage(path: string): this {
    return (this.image.src = path), (this.isImageLoaded = false), this;
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

  private onImageLoad() {
    this.isImageLoaded = true;
  }
}

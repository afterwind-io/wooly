import { Vector2 } from '../util/vector2';
import {
  Animation,
  AnimationLoopMode,
  AnimationPlayer,
  AnimationPropertyType,
  AnimationTrack,
} from './animation';
import { ImageResource } from './resource';
import { Sprite } from './sprite';

export class SpriteSheet {
  public readonly imageSource: ImageResource;
  public readonly frameH: number;
  public readonly frameV: number;
  public readonly frameHeight: number;
  public readonly frameWidth: number;

  /**
   * Creates an instance of SpriteSheet.
   *
   * @param {ImageResource} imageSource
   * @param {number} frameH The count defines how many frames in a row of a sprite sheet.
   * @param {number} frameV The count defines how many rows in a sprite sheet.
   * @memberof SpriteSheet
   */
  public constructor(
    imageSource: ImageResource,
    frameH: number,
    frameV: number
  ) {
    this.imageSource = imageSource;
    this.frameH = frameH;
    this.frameV = frameV;

    const imageWidth = imageSource.container.naturalWidth;
    this.frameWidth = Math.floor(imageWidth / frameH);

    const imageHeight = imageSource.container.naturalHeight;
    this.frameHeight = Math.floor(imageHeight / frameV);
  }

  public getAnchorByFrameIndex(frame: number): Vector2 {
    const i = frame % this.frameH;

    const x = i * this.frameWidth;
    const y = ((frame - i) / this.frameH) * this.frameHeight;

    return new Vector2(x, y);
  }
}

export interface AnimatedSpriteKeyFrames {
  time: number;
  frame: number;
}

/**
 * An entity to display a series of static frames like an animation.
 *
 * @export
 * @class AnimatedSprite
 * @extends {Sprite}
 */
export class AnimatedSprite extends Sprite {
  public readonly name: string = 'AnimatedSprite';

  private animation!: AnimationPlayer;
  private spriteSheet: SpriteSheet;

  private frames: number[] = [];
  private frameInterval: number = 0;
  private cursor: number = 0;

  public constructor(spriteSheet: SpriteSheet) {
    super(spriteSheet.imageSource);

    this.spriteSheet = spriteSheet;
  }

  public _Ready() {
    this.InitFrames();
    this.InitAnimations();
  }

  public _Update() {
    const { x, y } = this.spriteSheet.getAnchorByFrameIndex(this.cursor);
    this.SetClip(
      x,
      y,
      this.spriteSheet.frameWidth,
      this.spriteSheet.frameHeight
    );
  }

  public SetFrames(frames: number[]): this {
    if (frames.length === 0) {
      return this;
    }

    this.cursor = frames[0];
    return (this.frames = frames), this;
  }

  public SetContinuousFrames(from: number, to: number): this {
    if (to < from) {
      return this;
    }

    this.cursor = from;
    this.frames = Array.from({ length: to - from + 1 }).map((_, i) => from + i);

    return this;
  }

  public SetFrameInterval(interval: number): this {
    return (this.frameInterval = interval), this;
  }

  private InitFrames() {
    this.SetClip(
      0,
      0,
      this.spriteSheet.frameWidth,
      this.spriteSheet.frameHeight
    );
  }

  private InitAnimations() {
    const animationName = '_';
    const frameInterval = this.frameInterval;
    const duration = this.frameInterval * this.frames.length;

    const player = new AnimationPlayer();

    const animation = new Animation(animationName)
      .SetLoopMode(AnimationLoopMode.Loop)
      .SetDuration(duration);

    const track = new AnimationTrack(AnimationPropertyType.Number);
    // @ts-ignore
    track.SetTarget(this, 'cursor');
    for (let i = 0; i < this.frames.length; i++) {
      const frame = this.frames[i];

      track.AddKeyFrame({
        time: i * frameInterval,
        value: frame,
      });
    }

    player.AddAnimation(animation);
    animation.AddTrack(track);

    this.animation = player;
    this.AddChild(this.animation);

    player.Play(animationName);
  }
}

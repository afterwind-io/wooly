import { Entity } from "../../core/entity";
import { Vector2 } from "../../util/vector2";

export class AnimationPlayer extends Entity {
  private animeMap: Record<string, Animation> = {};
  private current: Animation | null = null;

  public _Update(delta: number) {
    if (!this.current) {
      return;
    }

    if (!this.current.isFinished) {
      this.current.Step(delta);
    }
  }

  public AddAnimation(animation: Animation): this {
    return (this.animeMap[animation.name] = animation), this;
  }

  public Play(name: string) {
    const anime = this.animeMap[name];
    if (!anime) {
      return console.warn(`[wooly] Animation "${name}" not exists.`);
    }

    if (this.current) {
      this.current.Reset();
    }

    this.current = anime;
  }
}

export const enum LoopMode {
  /**
   * Only plays once, and keeps property value when animation finishes.
   */
  Once,

  /**
   * Only plays once. When animation finishes,
   * changes the property to the value specified in the first keyframe.
   */
  OnceAndReset,
  Loop,
  Swing
}

interface AnimationSignals {
  OnFinish: () => void;
}

export class Animation {
  public name: string;
  public loopMode: LoopMode = LoopMode.Once;
  public isFinished: boolean = false;

  private timestamp: number = 0;
  private duration: number = 0;

  private tracks: AnimationTrack[] = [];

  public constructor(name: string) {
    this.name = name;
  }

  public AddTrack(track: AnimationTrack): this {
    this.tracks.push(track);
    return this;
  }

  public Reset() {
    this.Rewind();
    this.isFinished = false;

    for (const track of this.tracks) {
      track.Reset();
    }
  }

  public Rewind() {
    this.timestamp = 0;
  }

  public SetDuration(duration: number): this {
    return (this.duration = duration), this;
  }

  public SetLoopMode(mode: LoopMode): this {
    return (this.loopMode = mode), this;
  }

  public SetName(name: string): this {
    return (this.name = name), this;
  }

  public Step(delta: number) {
    this.timestamp += delta;

    if (this.timestamp > this.duration) {
      if (this.loopMode === LoopMode.Once) {
        this.Rewind();
        this.Stop();
      } else if (this.loopMode === LoopMode.OnceAndReset) {
        this.Reset();
        this.Stop();
      } else if (this.loopMode === LoopMode.Loop) {
        const i = this.timestamp - this.duration;
        this.Rewind();
        this.Step(i);
      } else if (this.loopMode === LoopMode.Swing) {
        // TODO
      }
    } else {
      for (const track of this.tracks) {
        track.Step(this.timestamp);
      }
    }
  }

  public Stop() {
    this.isFinished = true;
  }
}

export const enum PropertyType {
  Number,
  Vector2
}

export const enum InterpolationMethod {
  Linear
}

interface AnimationKeyframe<T = any> {
  key: number;
  value: T;
  interpolation?: InterpolationMethod;
}

export class AnimationTrack {
  private target: Entity | null = null;

  private type: PropertyType;
  private property: string = "";

  private keyframes: AnimationKeyframe[] = [];
  private currentKeyframeIndex: number = 0;

  public constructor(type: PropertyType) {
    this.type = type;
  }

  /**
   * Add Keyframes to the track.
   *
   * **NOTE**: Keyframes should be added in time order.
   *
   * @param {AnimationKeyframe} keyframe
   * @returns {this}
   * @memberof AnimationTrack
   */
  public AddKeyFrame(keyframe: AnimationKeyframe): this {
    this.keyframes.push(keyframe);
    return this;
  }

  public Reset() {
    this.currentKeyframeIndex = 0;

    if (this.keyframes.length > 0) {
      this.SetPropertyValue(this.keyframes[0].value);
    }
  }

  public SetTarget<T extends Entity>(target: T, property: keyof T): this {
    this.target = target;
    this.property = property as string;

    this.target.Connect("OnDestroy", this.OnTargetDestroy, this);
    return this;
  }

  public Step(timestamp: number) {
    const [start, end] = this.GetFrameSliceByTimeStamp(timestamp);
    const currentTime = timestamp - start.key;
    const duration = end.key - start.key || 1;

    const interpolate = this.GetInterpolationMethod(start);
    const type = this.type;
    let value: any = start.value;
    if (type === PropertyType.Vector2) {
      const beginX = (start.value as Vector2).x;
      const changeX = (end.value as Vector2).x - (start.value as Vector2).x;
      const x = interpolate(beginX, changeX, currentTime, duration);

      const beginY = (start.value as Vector2).y;
      const changeY = (end.value as Vector2).y - (start.value as Vector2).y;
      const y = interpolate(beginY, changeY, currentTime, duration);

      value = new Vector2(x, y);
    } else if (type === PropertyType.Number) {
      const begin = start.value;
      const change = end.value - start.value;

      value = interpolate(begin, change, currentTime, duration);
    }

    this.SetPropertyValue(value);
  }

  private GetInterpolationMethod(keyframe: AnimationKeyframe) {
    const interpolation = keyframe.interpolation || InterpolationMethod.Linear;
    // if (interpolation === InterpolationMethod.Linear) {
    // }

    // TODO
    return LinearInterpolation;
  }

  private GetFrameSliceByTimeStamp(
    timestamp: number
  ): [AnimationKeyframe, AnimationKeyframe] {
    // NOTE: 这里的前提假设是this.keyframes中的frames是按照时间顺序插入的
    // TODO: 上次结果缓存及算法优化
    let i = 0;
    while (i < this.keyframes.length) {
      const key = this.keyframes[i].key;

      if (key > timestamp) {
        --i;
        break;
      } else if (key === timestamp) {
        break;
      }

      ++i;
    }

    // this.currentKeyframeIndex = i;
    const start = this.keyframes[i];
    let end;
    if (i === this.keyframes.length - 1) {
      end = start;
    } else {
      end = this.keyframes[i + 1];
    }

    return [start, end];
  }

  private OnTargetDestroy() {
    this.target = null;
  }

  private SetPropertyValue(value: any) {
    // @ts-ignore
    this.target[this.property] = value;
  }
}

function LinearInterpolation(
  b: number,
  c: number,
  t: number,
  d: number
): number {
  return (c * t) / d + b;
}

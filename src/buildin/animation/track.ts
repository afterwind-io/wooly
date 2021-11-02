import { Entity } from '../../core/entity';
import { Vector2 } from '../../util/vector2';
import { GetInterpolationMethod, InterpolationMethod } from './interpolation';

export const enum AnimationPropertyType {
  Number,
  Vector2,
}

interface AnimationKeyframe<T = any> {
  time: number;
  value: T;
  interpolation?: InterpolationMethod;
}

export class AnimationTrack {
  private target: Entity | null = null;

  private type: AnimationPropertyType;
  private property: string = '';

  private keyframes: AnimationKeyframe[] = [];
  /**
   * A collection contains all timestamps of keyframes.
   *
   * @private
   * @type {number[]}
   * @memberof AnimationTrack
   */
  private timeline: number[] = [];

  public constructor(type: AnimationPropertyType) {
    this.type = type;
  }

  /**
   * Add Keyframes to the track.
   *
   * **NOTE**: Keyframes should be added in timed order.
   *
   * @param {AnimationKeyframe} keyframe
   * @returns {this}
   * @memberof AnimationTrack
   */
  public AddKeyFrame(keyframe: AnimationKeyframe): this {
    this.keyframes.push(keyframe);
    this.timeline.push(keyframe.time);
    return this;
  }

  public Reset() {
    if (this.keyframes.length > 0) {
      this.SetPropertyValue(this.keyframes[0].value);
    }
  }

  public SetTarget<T extends Entity>(target: T, property: keyof T): this {
    this.target = target;
    this.property = property as string;

    this.target.Connect('OnDestroy', this.OnTargetDestroy, this);
    return this;
  }

  public Step(timestamp: number) {
    const [start, end] = this.GetFrameSliceByTimestamp(timestamp);
    const currentTime = timestamp - start.time;
    const duration = end.time - start.time || 1;

    const interpolate = GetInterpolationMethod(start.interpolation);
    const type = this.type;
    let value: any = start.value;
    if (type === AnimationPropertyType.Vector2) {
      const beginX = (start.value as Vector2).x;
      const changeX = (end.value as Vector2).x - (start.value as Vector2).x;
      const x = interpolate(beginX, changeX, currentTime, duration);

      const beginY = (start.value as Vector2).y;
      const changeY = (end.value as Vector2).y - (start.value as Vector2).y;
      const y = interpolate(beginY, changeY, currentTime, duration);

      value = new Vector2(x, y);
    } else if (type === AnimationPropertyType.Number) {
      const begin = start.value;
      const change = end.value - start.value;

      value = interpolate(begin, change, currentTime, duration);
    }

    this.SetPropertyValue(value);
  }

  private GetFrameSliceByTimestamp(
    timestamp: number
  ): [AnimationKeyframe, AnimationKeyframe] {
    // NOTE: 这里的前提假设是this.keyframes中的frames是按照时间顺序插入的

    const keyframesCount = this.keyframes.length;
    const firstFrame = this.timeline[0];
    const lastFrameIndex = keyframesCount - 1;
    const lastFrame = this.timeline[lastFrameIndex];

    if (timestamp < firstFrame) {
      return [this.keyframes[0], this.keyframes[0]];
    }

    if (timestamp > lastFrame) {
      return [this.keyframes[lastFrameIndex], this.keyframes[lastFrameIndex]];
    }

    let i = 0;
    while (i < keyframesCount) {
      const frame = this.timeline[i];

      if (timestamp <= frame) {
        break;
      }

      ++i;
    }

    return [this.keyframes[i - 1], this.keyframes[i]];
  }

  private OnTargetDestroy() {
    this.target = null;
  }

  private SetPropertyValue(value: any) {
    // @ts-ignore
    this.target[this.property] = value;
  }
}

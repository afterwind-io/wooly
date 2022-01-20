import { Vector2 } from "../../util/vector2";
import { Interpolate, InterpolationMethod } from "./interpolation";

export type AnimatableProperty = number | Vector2;

export interface AnimationKeyframe<T extends AnimatableProperty> {
  time: number;
  value: T;
  interpolation?: InterpolationMethod;
}

interface AnimationTrackOptions<T extends AnimatableProperty> {
  onChange: (value: T) => void;
}

export class AnimationTrack<T extends AnimatableProperty> {
  private onChange: (value: T) => void;

  private keyframes: AnimationKeyframe<T>[] = [];
  /**
   * A collection contains all timestamps of keyframes.
   *
   * @private
   * @type {number[]}
   * @memberof AnimationTrack
   */
  private timeline: number[] = [];

  public constructor(options: AnimationTrackOptions<T>) {
    this.onChange = options.onChange;
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
  public AddKeyFrame(keyframe: AnimationKeyframe<T>): this {
    this.keyframes.push(keyframe);
    this.timeline.push(keyframe.time);
    return this;
  }

  public Reset() {
    if (this.keyframes.length === 0) {
      return;
    }

    const value = this.keyframes[0].value;
    this.onChange(value as T);
  }

  public Step(timestamp: number) {
    const [startFrame, endFrame] = this.GetFrameSliceByTimestamp(timestamp);

    const currentTime = timestamp - startFrame.time;
    const duration = endFrame.time - startFrame.time || 1;
    const amount = currentTime / duration;

    const method = startFrame.interpolation || InterpolationMethod.None;

    const startValue: unknown = startFrame.value;
    const endValue: unknown = endFrame.value;

    let value: any = startFrame.value;
    if (typeof startValue === "number") {
      value = Interpolate(method, startValue, endValue as number, amount);
    } else if (startValue instanceof Vector2) {
      const startX = startValue.x;
      const endX = (endValue as Vector2).x;
      const x = Interpolate(method, startX, endX, amount);

      const startY = startValue.y;
      const endY = (endValue as Vector2).y;
      const y = Interpolate(method, startY, endY, amount);

      value = new Vector2(x, y);
    }

    this.onChange(value);
  }

  private GetFrameSliceByTimestamp(
    timestamp: number
  ): [AnimationKeyframe<T>, AnimationKeyframe<T>] {
    // NOTE: 这里的前提假设是this.keyframes中的frames是按照时间顺序插入的

    const keyframesCount = this.keyframes.length;
    const firstFrame = this.timeline[0];
    const lastFrameIndex = keyframesCount - 1;
    const lastFrame = this.timeline[lastFrameIndex];

    if (timestamp < firstFrame) {
      return [this.keyframes[0], this.keyframes[0]];
    }

    if (timestamp >= lastFrame) {
      return [this.keyframes[lastFrameIndex], this.keyframes[lastFrameIndex]];
    }

    let i = 0;
    while (i < keyframesCount) {
      const frame = this.timeline[i];

      if (timestamp < frame) {
        break;
      }

      ++i;
    }

    return [this.keyframes[i - 1], this.keyframes[i]];
  }
}

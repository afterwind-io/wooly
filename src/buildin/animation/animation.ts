import { Clamp } from "../ui/common/utils";
import { AnimationTrack } from "./track";

abstract class AnimationController {
  public duration: number = 0;
  public isFinished: boolean = false;

  protected timestamp: number = 0;
  protected direction: 1 | -1 = 1;

  public Reset() {
    this.timestamp = 0;
    this.direction = 1;
    this.isFinished = false;
  }

  public abstract Step(delta: number): number;
}

class ACOnce extends AnimationController {
  public Step(delta: number): number {
    const duration = this.duration;
    const timestamp = Math.min(this.timestamp + delta, duration);

    this.timestamp = timestamp;

    if (timestamp >= duration) {
      this.isFinished = true;
      return duration;
    }

    return timestamp;
  }
}
class ACOnceAndReset extends AnimationController {
  public Step(delta: number): number {
    const duration = this.duration;
    const timestamp = this.timestamp + delta;

    if (timestamp >= duration) {
      this.timestamp = 0;
      this.isFinished = true;
      return duration;
    }

    this.timestamp = timestamp;
    return timestamp;
  }
}
class ACLoop extends AnimationController {
  public Step(delta: number): number {
    const duration = this.duration;
    let timestamp = this.timestamp + delta;

    if (timestamp >= duration) {
      timestamp = Math.max(timestamp - duration, 0);
    }

    this.timestamp = timestamp;
    return timestamp;
  }
}
class ACSwing extends AnimationController {
  public Step(delta: number): number {
    const duration = this.duration;
    let timestamp = this.timestamp + delta * this.direction;

    if (timestamp >= duration) {
      this.direction *= -1;
      timestamp = Clamp(duration - (timestamp - duration), 0, duration);
    } else if (timestamp < 0) {
      this.direction *= -1;
      timestamp = Clamp(0 - timestamp, 0, duration);
    }

    this.timestamp = timestamp;
    return timestamp;
  }
}

export const enum AnimationLoopMode {
  /**
   * Only plays once, and keeps property value when animation finishes.
   */
  Once,
  /**
   * Only plays once. When animation finishes,
   * resets the property to the value specified in the first keyframe.
   */
  OnceAndReset,
  /**
   * Repeat infinitely. When animation finishes,
   * it will start all over again.
   */
  Loop,
  /**
   * Repeat infinitely, but will bounce between the start and the end.
   */
  Swing,
}

const CONTROLLER_MAP: Record<AnimationLoopMode, new () => AnimationController> =
  {
    [AnimationLoopMode.Once]: ACOnce,
    [AnimationLoopMode.OnceAndReset]: ACOnceAndReset,
    [AnimationLoopMode.Loop]: ACLoop,
    [AnimationLoopMode.Swing]: ACSwing,
  };

export class Animation {
  public readonly name: string;

  private controller: AnimationController;
  private tracks: AnimationTrack<any>[] = [];

  public constructor(name: string) {
    this.name = name;
    this.controller = new ACOnce();
  }

  public AddTrack(track: AnimationTrack<any>): this {
    this.tracks.push(track);
    return this;
  }

  public Reset(): void {
    for (const track of this.tracks) {
      track.Reset();
    }

    this.controller.Reset();
  }

  public SetDuration(duration: number): this {
    return (this.controller.duration = duration), this;
  }

  public SetLoopMode(mode: AnimationLoopMode): this {
    this.controller = new CONTROLLER_MAP[mode]();
    return this;
  }

  public Step(delta: number): void {
    if (this.controller.isFinished) {
      return;
    }

    const timestamp = this.controller.Step(delta);
    for (const track of this.tracks) {
      track.Step(timestamp);
    }
  }
}

import { AnimationTrack } from './track';

export const enum AnimationLoopMode {
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
  Swing,
}

export class Animation {
  public readonly name: string;
  public loopMode: AnimationLoopMode = AnimationLoopMode.Once;
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

  public SetLoopMode(mode: AnimationLoopMode): this {
    return (this.loopMode = mode), this;
  }

  public Step(delta: number) {
    this.timestamp += delta;

    if (this.timestamp > this.duration) {
      if (this.loopMode === AnimationLoopMode.Once) {
        this.Rewind();
        this.Stop();
      } else if (this.loopMode === AnimationLoopMode.OnceAndReset) {
        this.Reset();
        this.Stop();
      } else if (this.loopMode === AnimationLoopMode.Loop) {
        const i = this.timestamp - this.duration;
        this.Rewind();
        this.Step(i);
      } else if (this.loopMode === AnimationLoopMode.Swing) {
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

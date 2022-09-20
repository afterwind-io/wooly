import { Animation, AnimationLoopMode, AnimationTrack } from "../animation";
import { AnimatableProperty } from "../animation/track";
import { InterpolationMethod } from "../interpolation";
import { CompositeWidget } from "./foundation/compositeWidget";
import { Reactive } from "./foundation/decorator";
import { Widget } from "./foundation/widget";

interface TransitionOptions<T extends AnimatableProperty> {
  duration: number;
  from: T;
  to: T;
  method?: InterpolationMethod;
  loopMode?: AnimationLoopMode;
  render: (value: T) => Widget;
}

export class Transition<T extends AnimatableProperty> extends CompositeWidget<
  TransitionOptions<T>
> {
  public readonly name: string = "Transition";

  private _animation!: Animation;
  private _propertyValue!: T;

  protected _Ready(): void {
    const { loopMode, duration, from, to, method } = this.options as Required<
      TransitionOptions<T>
    >;

    this._propertyValue = from;

    this._animation = new Animation("Transition")
      .SetLoopMode(loopMode || AnimationLoopMode.Once)
      .SetDuration(duration);

    const track = new AnimationTrack<T>({
      onChange: this.OnAnimation,
    });
    track
      .AddKeyFrame({
        time: 0,
        value: from,
        interpolation: method,
      })
      .AddKeyFrame({
        time: duration,
        value: to,
        interpolation: InterpolationMethod.None,
      });

    this._animation.AddTrack(track);
  }

  public _Update(delta: number): void {
    this._animation.Step(delta);
  }

  protected _Render(): Widget | null {
    return this.options.render(this._propertyValue);
  }

  protected NormalizeOptions(
    options: TransitionOptions<T>
  ): TransitionOptions<T> {
    return {
      method: InterpolationMethod.None,
      loopMode: AnimationLoopMode.Once,
      ...options,
    };
  }

  @Reactive
  private OnAnimation(value: T) {
    this._propertyValue = value;
  }
}

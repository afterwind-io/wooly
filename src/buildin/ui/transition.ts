import {
  Animation,
  AnimationLoopMode,
  AnimationTrack,
  InterpolationMethod,
} from "../animation";
import { AnimatableProperty } from "../animation/track";
import { Constraint } from "./common/constraint";
import { Size } from "./common/types";
import { Reactive } from "./foundation/decorator";
import { WidgetElement } from "./foundation/types";
import { Widget } from "./foundation/widget";

interface TransitionOptions<T extends AnimatableProperty> {
  duration: number;
  from: T;
  to: T;
  method?: InterpolationMethod;
  loopMode?: AnimationLoopMode;
  render: (value: T) => Widget;
}

export class Transition<T extends AnimatableProperty> extends Widget<
  TransitionOptions<T>
> {
  public readonly name: string = "Transition";

  private _animation!: Animation;
  private _propertyValue!: T;

  protected _Ready(): void {
    const { loopMode, duration, from, to, method } = this.options as Required<
      TransitionOptions<T>
    >;

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

  protected _Layout(constraint: Constraint): Size {
    return this.GetFirstChild()!.$Layout(constraint);
  }

  protected _Render(): WidgetElement {
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

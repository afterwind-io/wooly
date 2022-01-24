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
import { CommonWidgetOptions, WidgetElement } from "./foundation/types";
import { Widget } from "./foundation/widget";

interface TransitionOptions<T extends AnimatableProperty>
  extends CommonWidgetOptions {
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

  private _animation: Animation = new Animation("Transition");
  private _propertyValue!: T;

  public constructor(options: TransitionOptions<T>) {
    super(options);

    this._animation
      .SetLoopMode(options.loopMode || AnimationLoopMode.Once)
      .SetDuration(options.duration);

    const track = new AnimationTrack<T>({
      onChange: this.OnAnimation,
    });
    track
      .AddKeyFrame({
        time: 0,
        value: options.from,
        interpolation: options.method,
      })
      .AddKeyFrame({
        time: options.duration,
        value: options.to,
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

  @Reactive
  private OnAnimation(value: T) {
    this._propertyValue = value;
  }
}

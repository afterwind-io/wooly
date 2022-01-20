import {
  Animation,
  AnimationLoopMode,
  AnimationTrack,
  InterpolationMethod,
} from "../animation";
import { AnimatableProperty } from "../animation/track";
import { Length } from "./common/types";
import { Reactive } from "./foundation/decorator";
import { SingleChildWidget } from "./foundation/singleChildWidget";
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

export class Transition<T extends AnimatableProperty> extends SingleChildWidget<
  TransitionOptions<T>
> {
  public readonly name: string = "Transition";

  protected readonly isLooseBox: boolean = false;

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

  protected GetHeight(): Length {
    return "shrink";
  }

  protected GetWidth(): Length {
    return "shrink";
  }

  public _Update(delta: number): void {
    this._animation.Step(delta);
  }

  protected _Render(): WidgetElement {
    return this.options.render(this._propertyValue);
  }

  @Reactive
  private OnAnimation(value: T) {
    this._propertyValue = value;
  }
}

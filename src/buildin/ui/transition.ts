import {
  Animation,
  AnimationLoopMode,
  AnimationPropertyType,
  AnimationTrack,
  InterpolationMethod,
} from "../animation";
import { Length } from "./common/types";
import { Reactive } from "./foundation/decorator";
import { SingleChildWidget } from "./foundation/singleChildWidget";
import { CommonWidgetOptions, WidgetElement } from "./foundation/types";
import { Widget } from "./foundation/widget";

interface TransitionOptions<T = unknown> extends CommonWidgetOptions {
  duration: number;
  from: T;
  to: T;
  propertyType: AnimationPropertyType;
  method?: InterpolationMethod;
  loopMode?: AnimationLoopMode;
  render: (value: T) => Widget;
}

export class Transition<T> extends SingleChildWidget<TransitionOptions> {
  public readonly name: string = "Transition";

  protected readonly isLooseBox: boolean = false;

  private _animation: Animation = new Animation("Transition");
  private _propertyValue: unknown;

  public constructor(options: TransitionOptions<T>) {
    super(options as TransitionOptions<unknown>);

    this._animation
      .SetLoopMode(options.loopMode || AnimationLoopMode.Once)
      .SetDuration(options.duration);

    const track = new AnimationTrack({
      type: options.propertyType,
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
  private OnAnimation(value: unknown) {
    this._propertyValue = value;
  }
}

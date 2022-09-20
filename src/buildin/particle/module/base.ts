import { Entity } from "../../../core/entity";
import { Dice } from "../../../util/dice";
import { Vector2 } from "../../../util/vector2";
import { InterpolationMethod, Interpolate } from "../../interpolation";
import { Particle } from "../particle";

export interface ParticleModule {
  Init(host: Particle): void;
  Update(host: Particle, delta: number, material: Entity): void;
}

export interface ParticleModuleBaseOptions<T> {
  from: T;
  to: T;
  isOverLifetime?: boolean;
  interpolation?: InterpolationMethod;
}

export abstract class ParticleModuleBase<T = unknown>
  implements ParticleModule
{
  protected readonly from: T;
  protected readonly to: T;
  protected readonly isOverLifetime: boolean;
  protected readonly interpolation: InterpolationMethod;

  protected value: T;

  public constructor(options: ParticleModuleBaseOptions<T>) {
    this.from = options.from;
    this.to = options.to;
    this.value = this.from;
    this.isOverLifetime = options.isOverLifetime ?? false;
    this.interpolation = options.interpolation ?? InterpolationMethod.None;
  }

  public abstract Init(host: Particle): void;

  public abstract Update(host: Particle, delta: number, material: Entity): void;

  protected GetInitValue(min: number, max: number): number {
    if (this.isOverLifetime) {
      return min;
    }

    return Dice.NextFloat(min, max);
  }

  protected GetInitValueByVector2(min: Vector2, max: Vector2): Vector2 {
    if (this.isOverLifetime) {
      return min;
    }

    const x = Dice.NextFloat(min.x, max.x);
    const y = Dice.NextFloat(min.y, max.y);
    return new Vector2(x, y);
  }

  protected GetProgress(host: Particle): number {
    return host.elapsedTime / host.lifespan;
  }

  protected InterpolateByNumber(
    min: number,
    max: number,
    progress: number
  ): number {
    if (min === max) {
      return min;
    }

    return Interpolate(this.interpolation, min, max, progress);
  }

  protected InterpolateByVector2(
    min: Vector2,
    max: Vector2,
    progress: number
  ): Vector2 {
    if (min.Equals(max)) {
      return min;
    }

    const x = Interpolate(this.interpolation, min.x, max.x, progress);
    const y = Interpolate(this.interpolation, min.y, max.y, progress);
    return new Vector2(x, y);
  }
}

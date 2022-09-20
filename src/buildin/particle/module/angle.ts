import { Entity } from "../../../core/entity";
import { Dice } from "../../../util/dice";
import { Vector2 } from "../../../util/vector2";
import { Particle } from "../particle";
import { ParticleModuleBaseOptions, ParticleModuleBase } from "./base";

type ParticleAngleModuleOptions = Pick<
  ParticleModuleBaseOptions<number>,
  "from" | "to"
>;

export class ParticleAngleModule extends ParticleModuleBase<number> {
  public constructor(options: ParticleAngleModuleOptions) {
    super(options);
  }

  public Init(host: Particle): void {
    this.value = Dice.NextFloat(this.from, this.to);
    host.speed = Vector2.Right.Rotate(this.value);
  }

  public Update(host: Particle, delta: number, material: Entity): void {
    return;
  }
}

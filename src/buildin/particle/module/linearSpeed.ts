import { Entity } from "../../../core/entity";
import { Dice } from "../../../util/dice";
import { Particle } from "../particle";
import { ParticleModuleBase } from "./base";

export class ParticleLinearSpeedModule extends ParticleModuleBase<number> {
  public Init(host: Particle): void {
    if (!this.isOverLifetime) {
      this.value = Dice.NextFloat(this.from, this.to);
    }
  }

  public Update(host: Particle, delta: number, material: Entity): void {
    if (this.isOverLifetime) {
      this.value = this.InterpolateByNumber(
        this.from,
        this.to,
        this.GetProgress(host)
      );
    }

    host.speed = host.speed.Normalize().Multiply(this.value * delta);
    host.Translate(host.speed);
  }
}

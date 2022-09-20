import { Entity } from "../../../core/entity";
import { Particle } from "../particle";
import { ParticleModuleBase } from "./base";

export class ParticleRotationModule extends ParticleModuleBase<number> {
  public Init(host: Particle): void {
    this.value = this.GetInitValue(this.from, this.to);
    host.SetRotation(this.value);
  }

  public Update(host: Particle, delta: number, material: Entity): void {
    if (!this.isOverLifetime) {
      return;
    }

    this.value = this.InterpolateByNumber(
      this.from,
      this.to,
      this.GetProgress(host)
    );
    host.SetRotation(this.value);
  }
}

import { Entity } from "../../../core/entity";
import { Vector2 } from "../../../util/vector2";
import { Particle } from "../particle";
import { ParticleModuleBase } from "./base";

export class ParticleScaleModule extends ParticleModuleBase<Vector2> {
  public Init(host: Particle): void {
    this.value = this.GetInitValueByVector2(this.from, this.to);
    host.SetScale(this.value);
  }

  public Update(host: Particle, delta: number, material: Entity): void {
    if (!this.isOverLifetime) {
      return;
    }

    this.value = this.InterpolateByVector2(
      this.from,
      this.to,
      this.GetProgress(host)
    );
    host.SetScale(this.value);
  }
}

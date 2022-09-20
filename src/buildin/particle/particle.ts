import { Entity } from "../../core/entity";
import { Vector2 } from "../../util/vector2";
import { ParticleModule } from "./module/base";

interface ParticleOptions {
  material: Entity;
  modules: ParticleModule[];
}

export class Particle extends Entity {
  public speed: Vector2 = Vector2.Zero;

  public lifespan: number = Infinity;
  public elapsedTime: number = 0;

  private material: Entity;
  private modules: ParticleModule[];

  public constructor(options: ParticleOptions) {
    super();

    this.material = options.material;
    this.material.Connect("OnDestroy", () => this.Free());
    this.AddChild(this.material);

    this.modules = options.modules;
    for (const module of this.modules) {
      module.Init(this);
    }
  }

  public _Update(delta: number): void {
    for (const module of this.modules) {
      if (this.IsDestroyed) {
        break;
      }

      module.Update(this, delta, this.material);
    }
  }
}

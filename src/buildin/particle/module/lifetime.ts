import { CoolDown } from "../../../util/cooldown";
import { Dice } from "../../../util/dice";
import { Particle } from "../particle";
import { ParticleModule } from "./base";

interface ParticleLifetimeModuleOptions {
  min: number;
  max: number;
}

export class ParticleLifetimeModule implements ParticleModule {
  private lifetimeCounter: CoolDown;

  public constructor(options: ParticleLifetimeModuleOptions) {
    const { min, max } = options;
    this.lifetimeCounter = new CoolDown(Dice.NextFloat(min, max));
  }

  public Init(host: Particle): void {
    host.lifespan = this.lifetimeCounter.Remains;

    this.lifetimeCounter.Activate();
  }

  public Update(host: Particle, delta: number): void {
    this.lifetimeCounter.Cool(delta);

    if (!this.lifetimeCounter.isCooling) {
      host.Free();
    } else {
      host.elapsedTime = host.lifespan - this.lifetimeCounter.Remains;
    }
  }
}

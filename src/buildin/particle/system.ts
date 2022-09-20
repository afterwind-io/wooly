import { Entity } from "../../core/entity";
import { ParticleModule } from "./module/base";
import { Particle } from "./particle";

export enum ParticleEmissionMode {
  Burst,
  Continuous,
}

export enum ParticleEmissionTrigger {
  Auto,
  Manual,
}

type ExtractModuleBuilderOptions<T> = T extends new (
  arg: infer O
) => ParticleModule
  ? O
  : never;

type ParticleModuleBuilder = new (options: any) => ParticleModule;

type ParticleMaterialBuilder = () => Entity;

interface ModuleBuilderRecord {
  builder: ParticleModuleBuilder;
  options: any;
}

interface ParticleSystemOptions {
  amount?: number;
  mode?: ParticleEmissionMode;
  trigger?: ParticleEmissionTrigger;
  emitter?: Entity;
  materialBuilder?: ParticleMaterialBuilder;
}

export class ParticleSystem extends Entity {
  private readonly mode: ParticleEmissionMode;
  private readonly trigger: ParticleEmissionTrigger;

  private emitter: Entity | null;
  private amount: number;
  private moduleBuilders: ModuleBuilderRecord[] = [];
  private materialBuilder: ParticleMaterialBuilder | null = null;

  private isPaused: boolean = false;
  private particleAlive: number = 0;

  public constructor(options: ParticleSystemOptions) {
    super();

    this.mode = options.mode ?? ParticleEmissionMode.Continuous;
    this.trigger = options.trigger ?? ParticleEmissionTrigger.Auto;

    this.emitter = options.emitter ?? null;
    this.amount = options.amount ?? 1;
    this.materialBuilder = options.materialBuilder ?? null;
  }

  public _Update(delta: number): void {
    if (!this.isPaused && this.trigger !== ParticleEmissionTrigger.Manual) {
      this.EmitParticle();
    }
  }

  public AddModule<T extends ParticleModuleBuilder>(
    moduleCtor: T,
    options: ExtractModuleBuilderOptions<T>
  ): this {
    this.moduleBuilders.push({
      builder: moduleCtor,
      options,
    });

    return this;
  }

  public SetAmount(amount: number): this {
    return (this.amount = amount), this;
  }

  public SetEmitter(emitter: Entity): this {
    return (this.emitter = emitter), this;
  }

  public SetMaterialBuilder(materialBuilder: ParticleMaterialBuilder): this {
    return (this.materialBuilder = materialBuilder), this;
  }

  public Pause() {
    this.isPaused = true;
  }

  public Shoot() {
    if (this.trigger === ParticleEmissionTrigger.Manual) {
      this.EmitParticle();
    } else {
      this.isPaused = false;
    }
  }

  private AddParticle() {
    const material = this.materialBuilder?.();
    if (!material) {
      throw new Error(
        "[wooly] No material builder specified in ParticleSystem."
      );
    }

    const modules = this.moduleBuilders.map((record) => {
      const { builder, options } = record;
      return new builder(options);
    });

    const particle = new Particle({
      material,
      modules,
    });
    particle.Connect("OnDestroy", () => this.OnParticleDestroy());

    const host = this.emitter || this;
    host.AddChild(particle);

    this.particleAlive++;
  }

  private EmitParticle() {
    if (this.mode === ParticleEmissionMode.Burst) {
      for (let i = 0; i < this.amount; i++) {
        this.AddParticle();
      }
      this.isPaused = true;
    } else if (this.particleAlive < this.amount) {
      this.AddParticle();
    }
  }

  private OnParticleDestroy() {
    this.particleAlive--;
  }
}

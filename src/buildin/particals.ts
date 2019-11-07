import { Entity, EntitySignals } from "../core/entity";
import { CoolDown } from "../util/cooldown";
import { Vector2 } from "../util/vector2";
import { Dice } from "../util/dice";
import { Blackhole } from "../util/common";

export type ParticalsShape = 0;
export const PARTICALS_SHAPE_SPHERE = 0;

export class Particals extends Entity {
  private shape: ParticalsShape = PARTICALS_SHAPE_SPHERE;
  private enable: boolean = false;
  private amount: number = 16;
  private oneshot: boolean = false;
  private hasShot: boolean = false;

  private lifetimeMin: number = 1000 * 1;
  private lifetimeMax: number = 1000 * 1;
  private angleMin: number = 1;
  private angleMax: number = 1;
  private speedMin: number = 0.1;
  private speedMax: number = 0.1;
  private scaleMin: number = 1;
  private scaleMax: number = 1;
  private rotationMin: number = 0;
  private rotationMax: number = 0;

  private materialFn!: () => Entity;
  private transformFn: (p: Partical) => void = Blackhole;
  private particalAlive: number = 0;

  public _Update(delta: number) {
    if (this.oneshot && this.hasShot) {
      if (this.particalAlive === 0) {
        this.Free();
      }
    } else if (this.enable) {
      this.Shoot(delta);
    }
  }

  public SetAngleRange(min: number, max: number): this {
    return (this.angleMin = min), (this.angleMax = max), this;
  }

  public SetEnable(f: boolean): this {
    return (this.enable = f), this;
  }

  public SetLifeRange(min: number, max: number): this {
    return (this.lifetimeMin = min), (this.lifetimeMax = max), this;
  }

  public SetMaterial(f: () => Entity): this {
    return (this.materialFn = f), this;
  }

  public SetOneShot(f: boolean): this {
    return (this.oneshot = f), this;
  }

  public SetRotaionRange(min: number, max: number): this {
    return (this.rotationMin = min), (this.rotationMax = max), this;
  }

  public SetScaleRange(min: number, max: number): this {
    return (this.scaleMin = min), (this.scaleMax = max), this;
  }

  public SetSpeedRange(min: number, max: number): this {
    return (this.speedMin = min), (this.speedMax = max), this;
  }

  private AddPartical() {
    const lifetime = Dice.NextFloat(this.lifetimeMin, this.lifetimeMax);
    const angle = Dice.NextFloat(this.angleMin, this.angleMax);
    const speed = Dice.NextFloat(this.speedMin, this.speedMax);
    const scale = Dice.NextFloat(this.scaleMin, this.scaleMax);
    const rotation = Dice.NextFloat(this.rotationMin, this.rotationMax);

    const m = this.materialFn().SetRotation(rotation);
    const p = new Partical(lifetime, m, this.transformFn)
      .SetSpeed(speed)
      .SetRotation(angle)
      .SetScale(new Vector2(scale, scale));
    p.Connect("OnVanish", () => this.particalAlive--);
    this.particalAlive++;
    this.AddChild(p);
  }

  private Shoot(delta: number) {
    if (this.particalAlive > this.amount) {
      return;
    }

    if (this.oneshot) {
      for (let i = 0; i < this.amount - this.particalAlive; i++) {
        this.AddPartical();
      }
      this.hasShot = true;
      return;
    }

    this.AddPartical();
  }
}

interface ParticalSignals extends EntitySignals {
  OnVanish: () => void;
}

class Partical extends Entity<ParticalSignals> {
  private speed: number = 0.1;
  private lifetime: CoolDown;
  private transform!: (p: Partical) => void;

  public constructor(
    lifetime: number,
    material: Entity,
    transformFn: (p: Partical) => void
  ) {
    super();

    this.lifetime = new CoolDown(lifetime);
    this.lifetime.Activate();

    this.transform = transformFn;

    this.AddChild(material);
  }

  public _Update(delta: number) {
    this.lifetime.Cool(delta);

    if (this.lifetime.isCooling) {
      this.transform(this);
      this.Translate(this.Orientation.Multiply(this.speed * delta));
    } else {
      this.Emit("OnVanish");
      this.Free();
    }
  }

  public SetSpeed(s: number): this {
    return (this.speed = s), this;
  }
}

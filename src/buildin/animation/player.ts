import { Entity } from '../../core/entity';
import { Animation } from './animation';

export class AnimationPlayer extends Entity {
  private animeMap: Record<string, Animation> = {};
  private current: Animation | null = null;

  public _Update(delta: number) {
    if (!this.current) {
      return;
    }

    if (!this.current.isFinished) {
      this.current.Step(delta);
    }
  }

  public AddAnimation(animation: Animation): this {
    return (this.animeMap[animation.name] = animation), this;
  }

  public Play(name: string) {
    const anime = this.animeMap[name];
    if (!anime) {
      return console.warn(`[wooly] Animation "${name}" not exists.`);
    }

    if (this.current) {
      this.current.Reset();
    }

    this.current = anime;
  }
}

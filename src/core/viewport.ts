import { Vector2 } from '../util/vector2';

export class Viewport {
  public offset: Vector2 = new Vector2();
  public origin: Vector2 = new Vector2();
  public rotation: number = 0;
  public zoom: Vector2 = new Vector2(1, 1);

  public SetOffset(offset: Vector2): this {
    return (this.offset = offset), this;
  }

  public SetOrigin(origin: Vector2): this {
    return (this.origin = origin), this;
  }

  public SetRotation(rad: number): this {
    return (this.rotation = rad), this;
  }

  public SetZoom(zoom: Vector2): this {
    return (this.zoom = zoom), this;
  }
}

export const ViewportRegistry = new (class ViewportRegistry {
  private registry: Record<number, Viewport> = {};

  public constructor() {
    // FIXME 是否应该如此初始化默认layer？
    this.Add(0);
  }

  public Add(id: number = 0, viewport?: Viewport) {
    if (id in this.registry) {
      throw new Error(`[wooly] Can not add duplicate viewport: ${id}.`);
    }

    this.registry[id] = viewport || new Viewport();
  }

  public Get(id: number): Viewport {
    const viewport = this.registry[id];
    if (!viewport) {
      throw new Error(`[wooly] Viewport[${id}] not exists.`);
    }

    return viewport;
  }

  public Remove(id: number) {
    delete this.registry[id];
  }
})();

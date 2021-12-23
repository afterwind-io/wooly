import { Matrix2d } from "../util/matrix2d";
import { ReadonlyVector2, Vector2 } from "../util/vector2";

export class Viewport {
  private offsetMatrix: Matrix2d = Matrix2d.Identity();
  private projectMatrix: Matrix2d = Matrix2d.Identity();
  private transform: Matrix2d = Matrix2d.Identity();

  public get offset(): ReadonlyVector2 {
    return this.offsetMatrix.translation;
  }

  public set offset(offset: Vector2) {
    this.offsetMatrix.translation = offset;
    this.updateTransform();
  }

  public get origin(): ReadonlyVector2 {
    return this.projectMatrix.translation;
  }

  public set origin(origin: Vector2) {
    this.projectMatrix.translation = origin;
    this.updateTransform();
  }

  public get rotation(): number {
    return this.projectMatrix.rotation;
  }

  public set rotation(rad: number) {
    this.projectMatrix.rotation = rad;
    this.updateTransform();
  }

  public get zoom(): Vector2 {
    return this.offsetMatrix.scale;
  }

  public set zoom(scale: Vector2) {
    this.offsetMatrix.scale = scale;
    this.updateTransform();
  }

  public GetViewportTransform(): Matrix2d {
    return this.transform;
  }

  private updateTransform() {
    this.transform = this.offsetMatrix.Multiply(this.projectMatrix.Invert());
  }
}

export const ViewportRegistry = new (class ViewportRegistry {
  private registry: Record<number, Viewport> = {};

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

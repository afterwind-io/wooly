import { Matrix2d } from "../util/matrix2d";
import { ReadonlyVector2 } from "../util/vector2";
import { Signal } from "./signal";

interface ViewportSignal {
  OnUpdate(): void;
}

export class Viewport {
  private offsetMatrix: Matrix2d = Matrix2d.Identity();
  private projectMatrix: Matrix2d = Matrix2d.Identity();
  private transform: Matrix2d = Matrix2d.Identity();

  private signal: Signal<ViewportSignal> = new Signal();

  public get offset(): ReadonlyVector2 {
    return this.offsetMatrix.translation;
  }
  public set offset(offset: ReadonlyVector2) {
    this.offsetMatrix.translation = offset;
    this.UpdateTransform();
  }

  public get origin(): ReadonlyVector2 {
    return this.projectMatrix.translation;
  }
  public set origin(origin: ReadonlyVector2) {
    this.projectMatrix.translation = origin;
    this.UpdateTransform();
  }

  public get rotation(): number {
    return this.projectMatrix.rotation;
  }
  public set rotation(rad: number) {
    this.projectMatrix.rotation = rad;
    this.UpdateTransform();
  }

  public get zoom(): ReadonlyVector2 {
    return this.offsetMatrix.scale;
  }
  public set zoom(scale: ReadonlyVector2) {
    this.offsetMatrix.scale = scale;
    this.UpdateTransform();
  }

  public AddListener(onUpdate: () => void): void {
    this.signal.Connect("OnUpdate", onUpdate);
  }

  public GetViewportTransform(): Matrix2d {
    return this.transform;
  }

  private UpdateTransform() {
    this.transform = this.offsetMatrix.Multiply(this.projectMatrix.Invert());
    this.signal.Emit("OnUpdate");
  }
}

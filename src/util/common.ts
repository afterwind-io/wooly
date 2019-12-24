import { Vector2 } from "./vector2";

export type ParamType<T> = T extends (...args: infer R) => void ? R : any[];
export type Nullable<T> = T | null;

export function Blackhole(): void {
  return;
}

export function deg2rad(deg: number): number {
  return (Math.PI / 180) * deg;
}

export function GetTransformMatrix(
  position: Vector2,
  rotation: number,
  scale: Vector2
): [number, number, number, number, number, number] {
  const sin = Math.sin(rotation);
  const cos = Math.cos(rotation);

  return [cos * scale.x, sin, -sin, cos * scale.y, position.x, position.y];
}

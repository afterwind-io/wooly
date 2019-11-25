export type ParamType<T> = T extends (...args: infer R) => void ? R : any[];

export function Blackhole(): void {
  return;
}

export function deg2rad(deg: number): number {
  return (Math.PI / 180) * deg;
}

export type ParamType<T> = T extends (...args: infer R) => void ? R : any[];
export type Nullable<T> = T | null;

export function Blackhole(): void {
  return;
}

export function Identity<T>(arg: T): T {
  return arg;
}

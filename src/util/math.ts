export function Clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function Deg2Rad(deg: number): number {
  return (Math.PI / 180) * deg;
}

export function IsBetween(value: number, min: number, max: number): boolean {
  return value >= min && value < max;
}

export function Lerp(t: number, current: number, target: number): number {
  return (1 - t) * current + t * target;
}

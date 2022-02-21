export class MathEx {
  public static Clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  public static Deg2Rad(deg: number): number {
    return (Math.PI / 180) * deg;
  }

  public static Lerp(t: number, current: number, target: number): number {
    return (1 - t) * current + t * target;
  }
}

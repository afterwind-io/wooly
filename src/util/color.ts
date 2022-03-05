export class Color {
  public readonly r: number = 0;
  public readonly g: number = 0;
  public readonly b: number = 0;
  public readonly a: number = 1;

  constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  public ToString(): string {
    return `rgba(${this.r},${this.g},${this.b},${this.a})`;
  }
}

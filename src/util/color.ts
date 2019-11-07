export class Color {
  private r: number = 0;
  private g: number = 0;
  private b: number = 0;
  private a: number = 1;

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

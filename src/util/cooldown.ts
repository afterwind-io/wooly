export class CoolDown {
  private cd: number = 0;
  private timer: number = 0;
  public isCooling: boolean = false;

  public constructor(cd: number) {
    this.cd = cd;
  }

  public Activate() {
    this.isCooling = true;
    this.timer = this.cd;
  }

  public Cool(delta: number) {
    if (!this.isCooling) {
      return;
    }

    this.timer = Math.max(this.timer - delta, 0);
    if (this.timer == 0) {
      this.isCooling = false;
    }
  }

  public Reset() {
    this.isCooling = false;
    this.timer = this.cd;
  }
}

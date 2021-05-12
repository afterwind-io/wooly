import { SingleChildWidget } from './foundation/singleChildWidget';

export class Center extends SingleChildWidget {
  public readonly name: string = 'Center';

  protected readonly isLooseBox: boolean = true;

  public _PerformLayout() {
    const child = this.GetFirstChild();
    if (child) {
      const width = this._intrinsicWidth;
      const height = this._intrinsicHeight;
      const childWidth = child._intrinsicWidth;
      const childHeight = child._intrinsicHeight;

      child.position.x =
        (width -
          this.border.Horizontal -
          this.padding.Horizontal -
          childWidth) /
        2;
      child.position.y =
        (height - this.border.Vertical - this.padding.Vertical - childHeight) /
        2;
    }
  }
}

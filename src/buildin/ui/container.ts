import { SingleChildWidget } from './foundation/singleChildWidget';

/**
 * Provide basic container for controls.
 *
 * This is supposed to have a single child only.
 *
 * @export
 * @class Container
 * @extends {SingleChildWidget}
 */
export class Container extends SingleChildWidget {
  public readonly name: string = 'Container';

  protected readonly isLooseBox: boolean = true;

  protected _PerformLayout() {
    const child = this.GetFirstChild();
    if (child) {
      child.position.x =
        this.margin.left + this.border.left + this.padding.left;
      child.position.y = this.margin.top + this.border.top + this.padding.top;
    }
  }
}

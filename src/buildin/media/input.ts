import { Vector2 } from "../../util/vector2";

export const Input = new (class Input {
  public readonly BUTTON_LEFT: number = 0;
  public readonly BUTTON_MIDDLE: number = 1;
  public readonly BUTTON_RIGHT: number = 2;

  private mouseButtonMap: Record<number, boolean> = {};
  private mousePos: Vector2 = new Vector2();
  private prevMousePos: Vector2 = new Vector2();

  private keyDownMap: Record<string, boolean> = {};
  private keyPressMap: Record<string, boolean> = {};
  private prevKey: string = "";

  // FIXME 这个选项不应该放在这里设置
  private isEnableContentMenu: boolean = false;

  public Attach(target: HTMLElement) {
    document.addEventListener("keydown", this.OnKeyDown);
    document.addEventListener("keyup", this.OnKeyUp);

    target.addEventListener("contextmenu", this.OnContextMenu);

    target.addEventListener("mousedown", this.OnMouseDown, { passive: true });
    target.addEventListener("mousemove", this.OnMouseMove, { passive: true });
    target.addEventListener("mouseup", this.OnMouseUp, { passive: true });
  }

  public EnableContextMenu(f: boolean) {
    this.isEnableContentMenu = f;
  }

  public GetMouseDelta(): Vector2 {
    return this.mousePos.Substract(this.prevMousePos);
  }

  public GetMousePosition(): Vector2 {
    return this.mousePos.Clone();
  }

  public IsKeyDown(key: string): boolean {
    return !!this.keyDownMap[key];
  }

  public IsKeyPress(key: string): boolean {
    const f = !!this.keyPressMap[key];
    /**
     * 如果按键查询发生频率很高(Entity的Update中)，
     * 会发生OnKeyUp来不及重置keyPressMap的情况。
     * 因此在keypress为true的情况下，直接在查询中
     * 将值置为false，以防止下次查询出现伪真值的问题
     */
    if (f) {
      this.keyPressMap[key] = false;
    }
    return f;
  }

  public IsMouseDown(btn: number): boolean {
    return !!this.mouseButtonMap[btn];
  }

  public IsMouseMoved(): boolean {
    return this.mousePos.Equals(this.prevMousePos);
  }

  private OnContextMenu = (e: MouseEvent) => {
    if (this.isEnableContentMenu) {
      return;
    }

    e.preventDefault();
  };

  private OnKeyDown = (e: KeyboardEvent) => {
    const key = e.key;

    this.keyDownMap[key] = true;
    this.keyPressMap[key] = true;
    this.keyPressMap[this.prevKey] = false;

    this.prevKey = key;
  };

  private OnKeyUp = (e: KeyboardEvent) => {
    this.keyDownMap[e.key] = false;
    this.keyPressMap[e.key] = false;

    this.prevKey = "";
  };

  private OnMouseDown = (e: MouseEvent) => {
    this.mouseButtonMap[e.button] = true;
  };

  private OnMouseMove = (e: MouseEvent) => {
    this.prevMousePos.x = this.mousePos.x;
    this.prevMousePos.y = this.mousePos.y;
    this.mousePos.x = e.offsetX;
    this.mousePos.y = e.offsetY;
  };

  private OnMouseUp = (e: MouseEvent) => {
    this.mouseButtonMap[e.button] = false;
  };
})();

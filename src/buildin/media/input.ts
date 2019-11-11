import { Vector2 } from "../../util/vector2";

export const BUTTON_LEFT = 0;
export const BUTTON_RIGHT = 2;

function Init(target: HTMLElement) {
  target.oncontextmenu = e => e.preventDefault();

  target.onmousedown = OnMouseDown;
  target.onmouseup = OnMouseUp;
  target.onmousemove = OnMouseMove;
  document.onkeydown = OnKeyDown;
  document.onkeyup = OnKeyUp;
}

const mousePos: Vector2 = new Vector2();
const buttonMap: Record<number, boolean> = {};

function OnMouseDown(e: MouseEvent) {
  buttonMap[e.button] = true;
}

function OnMouseUp(e: MouseEvent) {
  buttonMap[e.button] = false;
}

function OnMouseMove(e: MouseEvent) {
  mousePos.x = e.x;
  mousePos.y = e.y;
}

let lastKey: string = "";
let switchMap: Record<string, boolean> = {};
let pressMap: Record<string, boolean> = {};

function OnKeyDown(e: KeyboardEvent) {
  const key = e.key;

  switchMap[key] = true;
  pressMap[key] = true;
  pressMap[lastKey] = false;

  lastKey = key;
}

function OnKeyUp(e: KeyboardEvent) {
  switchMap[e.key] = false;
  pressMap[e.key] = false;

  lastKey = "";
}

export const Input = {
  Init,
  GetMousePosition(): Vector2 {
    return new Vector2(mousePos.x, mousePos.y);
  },
  IsKeyDown(key: string): boolean {
    return !!switchMap[key];
  },
  IsKeyPress(key: string): boolean {
    const f = !!pressMap[key];
    /**
     * 如果按键查询发生频率很高(Entity的Update中)，
     * 会发生OnKeyUp来不及重置pressMap的情况。
     * 因此在keypress为true的情况下，直接在查询中
     * 将值置为false，以防止下次查询出现伪真值的问题
     */
    if (f) {
      pressMap[key] = false;
    }
    return f;
  },
  IsMouseDown(btn: number): boolean {
    return !!buttonMap[btn];
  }
};

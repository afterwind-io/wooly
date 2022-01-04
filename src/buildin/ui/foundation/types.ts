import { Widget } from "./widget";
import { Length } from "../common/types";

export const enum MouseAction {
  None,
  MouseDown,
  MouseUp,
  MouseClick,
}

export const enum MouseDragDrop {
  None,
  DragFocus,
  DragPending,
  DragStart,
  DragEnd,
  DragEnter,
  DragLeave,
  DragMove,
  Drop,
}

export const enum MouseMovement {
  None,
  MouseEnter,
  MouseLeave,
  MouseHover,
}

export interface CommonWidgetOptions {
  tag?: string;
  height?: Length;
  width?: Length;
}

export interface SingleChildWidgetOptions {
  child?: Widget;
}

export interface MultiChildWidgetOptions {
  children?: Widget[];
}

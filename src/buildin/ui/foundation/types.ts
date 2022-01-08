import { Widget } from "./widget";
import { Length } from "../common/types";
import { Nullable } from "../../../util/common";

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
  key?: string | number | symbol;
}

export interface SizableWidgetOptions {
  height?: Length;
  width?: Length;
}

export interface SingleChildWidgetOptions {
  child: Widget | null;
}

export interface MultiChildWidgetOptions {
  children: Nullable<Widget>[] | null;
}

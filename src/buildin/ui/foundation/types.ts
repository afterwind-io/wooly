import { WidgetRefObject } from "./ref";
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

export type WidgetElement = Widget<any, any> | WidgetElement[] | null;
export type WidgetRenderables = WidgetElement;

export interface CommonWidgetOptions {
  key?: string | number | symbol;
  ref?: WidgetRefObject<unknown>;
}

export interface SizableWidgetOptions {
  height?: Length;
  width?: Length;
}

export interface SingleChildWidgetOptions {
  child: Widget | null;
}

export interface MultiChildWidgetOptions {
  children: WidgetElement[] | null;
}

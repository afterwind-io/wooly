import { WidgetRefObject } from "./ref";
import { Widget } from "./widget";
import { Length } from "../common/types";

export type WidgetElement = Widget | null | (Widget | null)[];
export type WidgetRenderables = WidgetElement;

export interface CommonWidgetOptions {
  key?: string | number | symbol;
  ref?: WidgetRefObject<unknown>;
  tag?: string;
}

export interface SizableWidgetOptions {
  height?: Length;
  width?: Length;
}

export interface SingleChildWidgetOptions {
  child: Widget | null;
}

export interface MultiChildWidgetOptions {
  children: (Widget | null)[];
}

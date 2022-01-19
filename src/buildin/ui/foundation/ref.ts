export interface WidgetRefObject<T> {
  current: T | null;
}

export function CreateWidgetRef<T>(): WidgetRefObject<T> {
  return { current: null };
}

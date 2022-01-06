import { Length } from "./types";

export function Clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function GetLocalLength(
  min: number,
  max: number,
  desiredLength: Length,
  childLength: number
): number {
  if (desiredLength === "shrink") {
    return childLength;
  }

  if (desiredLength === "stretch") {
    return max;
  }

  return Clamp(desiredLength, min, max);
}

export function SwitchCursor(isActive: boolean): void {
  if (isActive) {
    document.body.style.cursor = "pointer";
  } else {
    document.body.style.cursor = "default";
  }
}

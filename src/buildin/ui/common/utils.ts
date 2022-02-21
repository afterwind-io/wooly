import { MathEx } from "../../../util/math";
import { Length } from "./types";

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

  return MathEx.Clamp(desiredLength, min, max);
}

export function SwitchCursor(
  isActive: boolean,
  cursorName: string = "pointer"
): void {
  if (isActive) {
    document.body.style.cursor = cursorName;
  } else {
    document.body.style.cursor = "default";
  }
}

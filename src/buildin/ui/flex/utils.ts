import { Size, Length } from "../common/types";
import { FlexDirection } from "./flex";

export function GetMainAxisLength(
  size: Size,
  direction: FlexDirection
): number {
  if (direction === FlexDirection.Horizontal) {
    return size.width;
  } else {
    return size.height;
  }
}

export function GetCrossAxisLength(
  size: Size,
  direction: FlexDirection
): number {
  if (direction === FlexDirection.Horizontal) {
    return size.height;
  } else {
    return size.width;
  }
}

export function GetMaxAxisLength(
  maxLength: number,
  desiredLength: Length
): number {
  if (desiredLength === "stretch") {
    return maxLength;
  } else if (desiredLength === "shrink") {
    /**
     * If the width of `Flex` depends on the total width of children,
     * there should be no free room for flexible children.
     */
    return 0;
  } else {
    return Math.min(maxLength, desiredLength);
  }
}

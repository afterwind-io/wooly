import { Vector2 } from "../../util/vector2";

export function Memorize<T extends Function>(fn: T): T {
  let hasCalled: boolean = false;
  let prevThis: any = null;
  let prevArgs: any[] = [];
  let prevResult: any = null;

  function shadowCompare(old: any[], now: any[]): boolean {
    if (old.length !== now.length) return false;
    return old.every((arg, i) => arg === now[i]);
  }

  // @ts-ignore
  return function(this: any, ...args: any[]) {
    if (hasCalled && prevThis === this && shadowCompare(prevArgs, args)) {
      return prevResult;
    }

    hasCalled = true;
    prevThis = this;
    prevArgs = args;
    prevResult = fn.apply(this, args);
    return prevResult;
  };
}

export function GetRectangleVertices(
  w: number,
  h: number,
  position: Vector2,
  rotation: number,
  scale: Vector2
): Vector2[] {
  const wS = new Vector2(w, 0).Rotate(rotation).Dot(scale);
  const hS = new Vector2(0, h).Rotate(rotation).Dot(scale);

  return [
    position,
    position.Add(wS),
    position.Add(wS.Add(hS)),
    position.Add(hS)
  ];
}

export function GetIntersectionLength(
  minA: number,
  maxA: number,
  minB: number,
  maxB: number
): number {
  let min1 = minA,
    max1 = maxA,
    min2 = minB,
    max2 = maxB;
  if (minB < minA) {
    min1 = minB;
    max1 = maxB;
    min2 = minA;
    max2 = maxA;
  }

  if (min2 >= max1) {
    return 0;
  } else if (max2 <= max1) {
    return max2 - min2;
  } else {
    return max1 - min2;
  }
}

export function IsIntersected(intersectionLength: number): boolean {
  return intersectionLength > 0.001;
}
